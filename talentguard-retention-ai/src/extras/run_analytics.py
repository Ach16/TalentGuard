from src.extras.expected_loss import generate_expected_loss
from src.extras.fairness_audit import generate_fairness_audit
from src.extras.hotspots import generate_hotspots
from src.extras.action_drafts import generate_action_drafts
import datetime
from src import config
import json

def main():
    print("Generating Expected Loss Prioritization...")
    generate_expected_loss()
    
    print("Generating Fairness Audit...")
    generate_fairness_audit()
    
    print("Generating Hotspots...")
    generate_hotspots()
    
    print("Generating Action Drafts...")
    generate_action_drafts()
    
    print("Saving Analytics Metadata...")
    metadata = {
        "generated_at": datetime.datetime.now().isoformat(),
        "seed": config.SEED,
        "evaluation_methodology": "Out-of-fold cross-validation for descriptive performance, full-model probability extrapolation for action prioritization.",
        "limitations": "These advanced analytics are exploratory. Predictions are probabilistic and associations are not causal. Financial estimates are illustrative."
    }
    with open(config.OUTPUTS_DIR / "analytics_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("Analytics generation complete.")

if __name__ == "__main__":
    main()
