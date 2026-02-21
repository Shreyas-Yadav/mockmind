"""DSPy signatures for diagram critique and state routing."""

import dspy


class DiagramCritiqueSignature(dspy.Signature):
    """Analyze the system design diagram and verbal explanation."""

    transcript = dspy.InputField()
    diagram_base64 = dspy.InputField()

    design_aspects = dspy.OutputField(desc="List of components with scores and issues")
    diagram_score = dspy.OutputField(desc="Score 0-1 for visual design quality")
    verbal_score = dspy.OutputField(desc="Score 0-1 for verbal explanation clarity")
    overall_score = dspy.OutputField(desc="Final weighted score 0-1")
    follow_up = dspy.OutputField(desc="One probing question or None")


class StateRouterSignature(dspy.Signature):
    """Determine conversation state and emotion."""

    transcript = dspy.InputField()
    previous_state = dspy.InputField()

    emotion = dspy.OutputField(desc="minimax_emotion tag: skeptical, encouraging, concerned, approving, curious, neutral")
    should_interrupt = dspy.OutputField(desc="Whether to cut off user")
    response = dspy.OutputField(desc="Feedback text to speak")
