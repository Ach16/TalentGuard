# TalentGuard - 3-Minute Hackathon Live Demo Script

**Target Duration:** 3 Minutes  
**Presenter Roles:** Product Lead & Technical Lead  
**Application State:** Pre-built production frontend on `localhost:5173`, FastAPI backend running on `localhost:8000`.

---

## 1. Problem Statement & Value Proposition (0:00 - 0:35)

> **Speaker:**
> "Welcome! TechNova Solutions employs over 12,000 workforce members, facing a ~16.1% annual attrition rate. Losing a skilled employee costs between 6 to 9 months of salary in replacement, retraining, and lost productivity.
> 
> However, HR has the bandwidth to conduct only **50 targeted retention interventions per month**. Randomly reaching out yields poor ROI. 
> 
> Enter **TalentGuard**: an AI-powered retention intelligence platform that identifies the top 50 highest-risk employees, explains their risk factors transparently, simulates retention strategies before spending budget, and prioritizes action by financial exposure."

---

## 2. System Architecture & Leakage-Free Design (0:35 - 1:00)

> **Speaker:**
> "Under the hood, TalentGuard runs a scikit-learn pipeline powered by Logistic Regression. We strictly drop all post-hire or target-correlated features—`Attrition`, `EmployeeNumber`, `EmployeeCount`, `StandardHours`, `Over18`—to eliminate target leakage.
> 
> We evaluate our model using **Stratified 5-Fold Cross-Validation Out-of-Fold (OOF)** predictions. On the real IBM HR dataset, our Logistic Regression model achieves an **OOF Precision@50 of 86.0%** and an **OOF ROC-AUC of 0.824**, delivering a **5.3x lift** over random guessing while maintaining linear interpretability."

---

## 3. Live Walkthrough: Top-50 Watch List & Explainability (1:00 - 1:35)

> **Action:** Navigate to `Top-50 Watchlist` tab (`http://localhost:5173/watchlist`).
> 
> **Speaker:**
> "Here is our core interface—the **Top-50 Retention Watch List**. 
> Out of 12,000 workforce records, the top 50 risk targets are ranked dynamically.
> 
> Notice that out of these 50 employees, 43 are true historical leavers. With an assumed 20% intervention success rate and 6 months of salary replacement cost, this single watchlist cycle preserves **~$213,000 in estimated salary cost**.
> 
> Every employee record includes the **Top 3 risk drivers** (e.g., `OverTime (high)`, `YearsSinceLastPromotion (high)`). For the top 10 ranked employees, TalentGuard automatically assigns a deterministic, actionable retention recommendation, such as *'Review workload and approve time-off or team support'*."

---

## 4. Live Walkthrough: What-If Retention Simulator (1:35 - 2:10)

> **Action:** Navigate to `What-If Simulator` tab (`http://localhost:5173/simulator`). Select an employee (e.g., Employee #1).
> 
> **Speaker:**
> "Before committing HR budget, managers can test hypothetical retention interventions using our **What-If Simulator**.
> 
> Let's select Employee #1. Their baseline predicted risk is high. If HR removes overtime requirement (`OverTime: No`) and offers a 15% salary hike (`MonthlyIncome Hike: +15%`), we click **Run Simulation**.
> 
> The model re-evaluates the transformed feature vector in real-time, showing a significant drop in predicted risk percentage. This gives HR concrete, data-backed guidance before holding stay-interviews."

---

## 5. Live Walkthrough: Advanced Analytics & Action Drafts (2:10 - 2:40)

> **Action:** Navigate to `Advanced Analytics` tab (`http://localhost:5173/analytics`).
> 
> **Speaker:**
> "Beyond basic risk scoring, TalentGuard provides four advanced business intelligence views:
> 
> 1. **Expected Loss Prioritization:** Re-ranks employees by combining probability with monthly salary to highlight absolute financial risk exposure.
> 2. **Fairness Audit:** Evaluates representation and risk distribution across demographics (Gender, Age, Marital Status) to audit model behavior.
> 3. **Hotspots:** Aggregates attrition risk across Departments and Job Roles (e.g., Sales vs R&D).
> 4. **Action Drafts:** Generates pre-formatted outreach email templates with `PENDING_APPROVAL` status. **No emails are automatically sent**, ensuring total human oversight."

---

## 6. Responsible AI, Honest Limitations & Wrap-Up (2:40 - 3:00)

> **Speaker:**
> "To be transparent about limitations:
> - **Probabilistic, Not Causal:** Our simulator measures predictive sensitivity, not guaranteed retention.
> - **Human Oversight:** TalentGuard provides recommendations only; final decisions remain strictly with HR managers.
> - **Zero Synthetic Data:** All metrics and artifacts are trained on real, non-fabricated data.
> 
> TalentGuard equips TechNova Solutions with precise, explainable, and accountable retention intelligence. Thank you!"

---

## Presentation Fallback Plan

| Scenario / Risk | Fallback Strategy |
| :--- | :--- |
| **Backend API Down / Network Failure** | The frontend will display error alerts gracefully. Re-launch backend in terminal: `uvicorn api.main:app --reload --port 8000`. |
| **Kaggle API / Network Unavailable** | The dataset is already saved at `data/raw/WA_Fn-UseC_-HR-Employee-Attrition.csv`. `download_data.py` auto-detects this file and bypasses download seamlessly. |
| **Missing Analytics Artifacts** | Run `python -m src.extras.run_analytics` to regenerate `top50_by_cost.csv`, `fairness_audit.json`, `department_hotspots.csv`, and `retention_action_drafts.json` in under 3 seconds. |
| **Frontend Build / Port Conflict** | Run `npm run build` followed by `npm run preview` inside `frontend/` to serve static assets on an alternate port. |
