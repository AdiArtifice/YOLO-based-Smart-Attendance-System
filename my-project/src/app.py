from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/detect", methods=["POST"])
def detect():
    data = request.get_json()
    image = data.get("image")  # base64 image
    # TODO: Run YOLO detection here
    detections = [
        {"id": "1", "name": "Student1"},
        {"id": "2", "name": "Student2"}
    ]
    return jsonify({"detections": detections})

@app.route("/save-attendance", methods=["POST"])
def save_attendance():
    data = request.get_json()
    # TODO: Save to file/db
    return jsonify({"message": "Attendance saved!"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
