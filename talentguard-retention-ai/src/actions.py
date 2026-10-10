def get_recommendation(reasons: list[str]) -> str:
    """
    Provide a retention recommendation based on the top reasons.
    Rules cover:
    - Overtime and workload
    - Compensation benchmarking
    - Job satisfaction
    - Work environment
    - Work-life balance
    - Tenure and career development
    - Promotion opportunities
    - Business travel
    - Long-term incentives (StockOptionLevel)
    - Distance from home
    - Sales-role targets and burnout
    """
    reasons_text = " ".join(reasons).lower()
    
    if "overtime: yes" in reasons_text or "workload" in reasons_text:
        return "Review workload and approve time-off or team support"
    if "monthlyincome (low)" in reasons_text or "compensation" in reasons_text:
        return "Conduct off-cycle compensation benchmark review"
    if "jobsatisfaction (low)" in reasons_text:
        return "Schedule 1-on-1 to identify friction points in current role"
    if "environmentsatisfaction (low)" in reasons_text:
        return "Evaluate team dynamics and immediate workspace concerns"
    if "worklifebalance (low)" in reasons_text:
        return "Discuss flexible working arrangements or schedule adjustments"
    if "yearssincelastpromotion (high)" in reasons_text or "promotion" in reasons_text:
        return "Draft concrete progression plan with clear promotion milestones"
    if "yearsatcompany (high)" in reasons_text or "tenure" in reasons_text:
        return "Discuss internal mobility or new leadership responsibilities"
    if "businesstravel: travel_frequently" in reasons_text:
        return "Review travel load and temporarily assign local accounts"
    if "stockoptionlevel (low)" in reasons_text:
        return "Review eligibility for long-term equity or retention bonus"
    if "distancefromhome (high)" in reasons_text:
        return "Offer additional remote work days or commuting stipend"
    if "sales" in reasons_text and "burnout" in reasons_text:
        return "Review sales targets and account distribution for burnout risks"
    
    return "Schedule stay-interview to discuss general career satisfaction"

def apply_recommendations(reasons_list: list[list[str]], ranks: list[int]) -> list[str]:
    """
    Apply recommendations to the top 10 employees only.
    ranks is a list of 1-based ranks.
    """
    actions = []
    for reasons, rank in zip(reasons_list, ranks):
        if rank <= 10:
            actions.append(get_recommendation(reasons))
        else:
            actions.append("")
    return actions
