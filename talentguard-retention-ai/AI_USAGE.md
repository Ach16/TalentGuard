# AI Usage and Human-in-the-Loop Safeguards

TalentGuard is designed as an AI-augmented intelligence tool for Human Resources. It does not replace HR professionals or make automated employment decisions.

## AI Tasks & Human Review

| Feature | AI-Assisted Task | Verification / Human Review | Known Limitations |
|---------|-----------------|-----------------------------|-------------------|
| **Predictive Risk Modeling** | Logistic Regression predicts the probability of an employee leaving based on historical trends. | HR uses the Top-50 list solely as a prioritized queue for review. | Probabilistic, not guaranteed. Past behavior does not guarantee future actions. |
| **Explanation Extraction** | Extracts the most prominent feature contributors driving a specific employee's risk score. | HR reviews the structured reasons alongside the employee's holistic file. | Correlational features (e.g., Job Satisfaction) are not always the causal root. |
| **What-If Simulator** | Simulates risk changes if specific interventions (e.g., salary hikes) were implemented. | HR manually evaluates simulation outputs before executing expensive retention strategies. | The model is correlational. Increasing salary in the simulator does not guarantee the employee will stay in reality. |
| **Retention Action Drafts** | Generates boilerplate PENDING_APPROVAL outreach strategies combining explanations with HR guidelines. | Managers MUST review, edit, and manually approve any email before it is sent. | Language may occasionally lack nuanced context of an employee's personal situation. |
| **Expected Loss Prioritization** | Computes a financial risk score by weighting predicted probability against 6-month salary costs. | Evaluated alongside standard predicted risk; financial budgets are approved manually. | Class-weighted probabilities are uncalibrated and estimates are strictly illustrative, not literal dollars saved. |

## Explicit Safeguards
1. **No Automated Decisions**: The platform has no capability to terminate, promote, or email employees on its own.
2. **Generative Draft Isolation**: The action-draft generation uses deterministic string templating over rule-based recommendations. It is totally isolated from external LLM APIs, preventing PII leaks or hallucinations.
3. **Fairness Diagnostics**: Demographic analysis is decoupled from the live operational model and used strictly for periodic internal bias audits. 