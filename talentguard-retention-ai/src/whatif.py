import pandas as pd

def what_if(model, row: pd.DataFrame, changes: dict) -> tuple[float, float]:
    """
    Calculate the original and modified predicted attrition probability for a single employee.
    row: DataFrame containing exactly one employee's features (without EmployeeNumber, Attrition, etc.)
    changes: dict of feature modifications (e.g. {'OverTime': 'No', 'MonthlyIncome': 6000})
    """
    if len(row) != 1:
        raise ValueError("what_if expects exactly one row")
        
    # Original probability
    prob_before = model.predict_proba(row)[0, 1]
    
    # Modify row
    row_modified = row.copy()
    
    for feature, value in changes.items():
        if feature not in row.columns:
            raise ValueError(f"Unknown feature: {feature}")
        
        # Check specific constraints based on requirements
        if feature == 'OverTime' and value not in ['Yes', 'No']:
            raise ValueError("OverTime must be 'Yes' or 'No'")
        if feature == 'BusinessTravel' and value not in ['Non-Travel', 'Travel_Rarely', 'Travel_Frequently']:
            raise ValueError(f"Invalid BusinessTravel value: {value}")
        if feature == 'JobSatisfaction' and value not in [1, 2, 3, 4]:
            raise ValueError("JobSatisfaction must be 1, 2, 3, or 4")
        if feature == 'MonthlyIncome':
            if not isinstance(value, (int, float)):
                raise ValueError("MonthlyIncome must be numeric")
            
        row_modified[feature] = value
        
    # Modified probability
    prob_after = model.predict_proba(row_modified)[0, 1]
    
    return float(prob_before), float(prob_after)
