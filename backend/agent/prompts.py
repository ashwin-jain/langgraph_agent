from step_ids import StepID

PROMPTS = {
    StepID.ANALYSIS_1: lambda state: f"""
    Based on the market analysis data, identify key market opportunities.
    Previous step output: {state.get(StepID.ANALYSIS_0, "<undefined>")}
    """,
    StepID.ANALYSIS_2: lambda state: f"""
    Analyze competitive positioning and market dynamics.
    Previous analysis: {state.get(StepID.ANALYSIS_1, "<undefined>")}
    """,
    StepID.SLIDE_2: lambda state: f"""
    Create a summary slide for competitive analysis. Return only a concise JSON for a presentation slide and nothing else.
    Analysis output: {state.get(StepID.ANALYSIS_2, "<undefined>")}
    """,
    StepID.ANALYSIS_4: lambda state: f"""
    Synthesize findings and develop strategic recommendations.
    Previous analyses: {state.get(StepID.ANALYSIS_3, "<undefined>")}
    """,
    StepID.SLIDE_4: lambda state: f"""
    Create a summary slide for strategic recommendations. Return only a concise JSON for a presentation slide and nothing else.
    Analysis output: {state.get(StepID.ANALYSIS_4, "<undefined>")}
    """
}