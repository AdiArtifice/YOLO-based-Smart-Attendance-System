import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inference_sdk import InferenceHTTPClient
from starlette.responses import JSONResponse

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
WORKSPACE_NAME = os.getenv("WORKSPACE_NAME", "tray-detection-cfllw")
WORKFLOW_ID = os.getenv("WORKFLOW_ID", "detect-and-classify")
API_URL = os.getenv("INFERENCE_API_URL", "http://localhost:9001")  # local inference server

if not ROBOFLOW_API_KEY:
    raise RuntimeError("Missing ROBOFLOW_API_KEY in environment.")

client = InferenceHTTPClient(api_url=API_URL, api_key=ROBOFLOW_API_KEY)

app = FastAPI(title="Local Roboflow Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TINY_IMAGE_PNG = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII="
)

@app.get("/health")
async def health():
    """Basic health check that also verifies we have a Roboflow API key configured."""
    return {"status": "ok", "workspace": WORKSPACE_NAME, "workflow": WORKFLOW_ID, "apiKeySet": bool(ROBOFLOW_API_KEY)}

@app.post("/infer")
async def infer_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith(("image/", "application/octet-stream")):
        raise HTTPException(status_code=400, detail="Please upload an image file.")
    suffix = os.path.splitext(file.filename)[-1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        tmp.write(content)
        local_path = tmp.name
    try:
        # Use exact workflow input key name "image"
        result = client.run_workflow(
            workspace_name=WORKSPACE_NAME,
            workflow_id=WORKFLOW_ID,
            images={"image": local_path},
        )
        # Extract class IDs heuristically
        class_ids = []
        outputs = result.get("outputs", result)
        predictions_candidate = None
        if isinstance(outputs, dict):
            for key in ("track_predictions", "predictions", "detections"):
                if key in outputs:
                    predictions_candidate = outputs[key]
                    break
        # Some shapes: {'predictions': {'detections': [...]}}
        if isinstance(predictions_candidate, dict) and "detections" in predictions_candidate:
            detections_list = predictions_candidate["detections"]
        elif isinstance(predictions_candidate, list):
            detections_list = predictions_candidate
        else:
            detections_list = []
        for det in detections_list:
            class_ids.append(det.get("class_id") or det.get("class") or det.get("name"))
        return JSONResponse({"class_ids": class_ids, "raw": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")
    finally:
        # Optionally remove temp file; comment out if debugging
        try:
            os.unlink(local_path)
        except OSError:
            pass
