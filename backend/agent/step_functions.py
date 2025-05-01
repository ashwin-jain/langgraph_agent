from step_ids import *
import time
import pprint

def analysis_step0(state):
    pprint.pp(state)
    time.sleep(2)
    result = {
        "market_size": 1000000000,
        "growth_rate": 0.15,
        "key_segments": ["segment1", "segment2", "segment3"],
        "competitive_landscape": {"major_players": 5, "market_concentration": "medium"}
    }
    return result

def analysis_step3(state):
    pprint.pp(state)
    result = {
        "internal_capabilities": {"technology": 0.8, "market_reach": 0.6, "innovation": 0.7},
        "gaps_identified": ["digital_transformation", "customer_experience", "data_analytics"]
    }
    time.sleep(3)
    return result

FUNCTIONS = {
    StepID.ANALYSIS_0: analysis_step0,
    StepID.ANALYSIS_3: analysis_step3
}
