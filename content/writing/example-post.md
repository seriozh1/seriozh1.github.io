+++
title = "Example post: replicating a small result"
date = 2026-10-09
draft = false
description = "A template showing the post format: summary first, then setup, results, and limitations."
tags = ["interpretability", "replication"]
+++

**TL;DR:** One or two sentences with the main result. Readers skimming your
site should get the point here.

## Motivation

Why does this question matter for AI safety? What did you expect to find?

## Setup

Model, data, and method. Enough detail for someone to reproduce it.

```python
import torch

def logit_diff(logits: torch.Tensor, correct: int, incorrect: int) -> torch.Tensor:
    """Difference between the correct and incorrect answer logits."""
    return logits[..., correct] - logits[..., incorrect]
```

## Results

| Condition | Metric | Std |
|-----------|-------:|----:|
| Baseline  |   0.62 | 0.03 |
| Ablated   |   0.18 | 0.04 |

> Use a blockquote for a key takeaway or a quote from the original paper.

## Limitations and next steps

- What this does *not* show.
- What you would run next with more time or compute.

Code: [github.com/seriozh1/...](https://github.com/seriozh1)
