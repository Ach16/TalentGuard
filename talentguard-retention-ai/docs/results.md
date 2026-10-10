# TalentGuard - Results and Metrics

## Model Performance
- **Selected Model:** Logistic Regression
- **Baseline Attrition Rate:** 16.1%
- **Out-of-Fold ROC-AUC:** 0.824
- **Out-of-Fold PR-AUC:** 0.578
- **Out-of-Fold Precision@50:** 86.0% (43 out of the top 50 flagged employees actually left)
- **Model Lift:** 5.3x improvement over random guessing

## Business Impact Estimates
- **Leavers Caught in Top 50:** 43
- **Assumed Intervention Success Rate:** 20%
- **Estimated People Saved:** 8.6 employees
- **Assumed Replacement Cost:** 6 months of salary
- **Estimated Financial Savings (Avoided Costs):** ~$213,122 per intervention cycle

## Analytics Overview
- **Expected Loss Score:** Extrapolates standard probability by factor of salary, aligning retention prioritization tightly with business objectives. 
- **Fairness Audit:** Demonstrated transparent monitoring for gender, age, and marital status biases. Diagnostics verified that excluding protected attributes marginally lowered performance, reinforcing the current leakage-safe pipeline.
- **Action Drafts:** Drafted HR outreach strategies securely without engaging external LLMs in the critical path.