import numpy as np

def _clean_feature_name(name: str) -> str:
    if name.startswith('num__'):
        return name[5:]
    if name.startswith('cat__'):
        return name[5:]
    return name

def top_reasons(model, X, k=3) -> list[list[str]]:
    """
    Generate the top k reasons for each employee's predicted risk.
    """
    pre = model.named_steps['pre']
    clf = model.named_steps['clf']
    coefs = clf.coef_[0]
    
    # Get feature names
    feature_names = pre.get_feature_names_out()
    clean_names = [_clean_feature_name(n) for n in feature_names]
    
    # Identify which original features were numeric (scaled) vs categorical
    # This assumes the transformers were 'num' and 'cat'
    numeric_features = []
    if 'num' in pre.named_transformers_:
        # Depending on scikit-learn version, we can get feature names
        try:
            numeric_features = pre.named_transformers_['num'].get_feature_names_out()
        except:
            pass # fallback
    
    # Transform X
    X_transformed = pre.transform(X)
    
    # Calculate contributions: feature_value * coefficient
    contributions = X_transformed * coefs
    
    reasons = []
    for i in range(len(X)):
        row_contribs = contributions[i]
        
        # Get indices of top k positive contributions
        # We only care about reasons increasing risk (positive contribution)
        positive_indices = [idx for idx in range(len(row_contribs)) if row_contribs[idx] > 0]
        
        # Sort these indices by contribution magnitude descending
        positive_indices.sort(key=lambda idx: row_contribs[idx], reverse=True)
        
        top_indices = positive_indices[:k]
        
        row_reasons = []
        for idx in top_indices:
            feat_name = clean_names[idx]
            val = X_transformed[i, idx]
            
            # Format the reason based on whether it's numeric or categorical
            # If it has an underscore, it might be a categorical one-hot feature (e.g. JobRole_Sales Executive)
            if "_" in feat_name and not feat_name.startswith("Num") and not feat_name.startswith("Years"):
                feat, val_str = feat_name.split("_", 1)
                row_reasons.append(f"{feat}: {val_str}")
            else:
                # Numeric
                if val > 0.5:
                    indicator = "(high)"
                elif val < -0.5:
                    indicator = "(low)"
                else:
                    indicator = ""
                row_reasons.append(f"{feat_name} {indicator}".strip())
                
        # If no positive reasons, add a fallback
        if not row_reasons:
            row_reasons.append("Baseline risk profile")
            
        reasons.append(row_reasons)
        
    return reasons
