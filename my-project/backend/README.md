# Local Roboflow Workflow Backend (FastAPI)

This backend provides a simple upload endpoint to run a Roboflow Workflow via a locally running Inference Server.

## Prerequisites
- Python 3.9+
- `pip install inference-cli` (>= 0.9.18) for the local server
- Docker OR native environment capable of running the inference server
- A valid `ROBOFLOW_API_KEY` with access to the workflow

## 1. Start Local Inference Server
```bash
pip install inference-cli
inference server start --port 9001
# Optional status
inference server status
```

## 2. Create and Populate .env
Create a `.env` (next to this README if desired or export vars) with:
```
ROBOFLOW_API_KEY=YOUR_KEY
WORKSPACE_NAME=tray-detection-cfllw
WORKFLOW_ID=detect-and-classify
INFERENCE_API_URL=http://localhost:9001
```

## 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

## 4. Run FastAPI App
```bash
uvicorn backend.main:app --reload --port 8000
```

## 5. Test Endpoints
Health:
```bash
curl http://localhost:8000/health
```
Inference (image upload):
```bash
curl -X POST http://localhost:8000/infer \
  -F "file=@/path/to/image.jpg"
```

## Response Shape
```json
{
  "class_ids": ["classA", "classB"],
  "raw": { "outputs": { ... full workflow response ... } }
}
```

## Notes
- Uses key name `image` when invoking `run_workflow` to match workflow input definition.
- Temporary file is deleted after each request; comment out deletion for debugging.
- Adjust origin list in CORS middleware if deploying beyond localhost.
