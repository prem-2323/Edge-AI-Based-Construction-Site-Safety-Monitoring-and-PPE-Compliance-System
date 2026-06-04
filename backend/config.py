"""Backend configuration."""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "best.pt"

# Temp storage for uploaded videos and output
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# PPE: class names that count as "detected" (depends on your YOLO model's names)
# Adjust to match your best.pt class indices/names
REQUIRED_PPE = ["helmet", "vest"]  # minimal for demo; expand to match your model
PPE_CLASS_ALIASES = {"hat": "helmet", "hard_hat": "helmet", "safety_vest": "vest", "vest": "vest"}

# Temporal: frames to consider for voting
TEMPORAL_WINDOW = 5
UNSAFE_THRESHOLD = 3  # if UNSAFE in >= this many of last TEMPORAL_WINDOW frames → confirm

# Model load: set to False to run without .pt (e.g. demo/simulate)
REQUIRE_MODEL = os.getenv("REQUIRE_MODEL", "false").lower() == "true"
