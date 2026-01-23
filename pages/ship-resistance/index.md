---
layout: default
title: Ship Resistance Calculation
description: Mathematical explanation of how damage resistance is calculated for ship armor and hull reinforcement packages in Elite: Dangerous.
---

# Ship Resistance Calculation

This document explains the mathematical formulas used to calculate effective damage resistance for ships in Elite: Dangerous, specifically for armor and hull reinforcement packages.

## Overview

The resistance calculation system applies **diminishing returns** to prevent resistance values from becoming too high. The system processes modules sequentially, applying a special formula that caps effective resistance while allowing multiplicative stacking.

## Core Formula: Stack Damage Resistance

The heart of the calculation is the `stackDamageResistance` function, which applies diminishing returns to resistance values:

### Parameters

- **baseResistance**: The current resistance value (0.0 to 1.0)
- **moduleResistance**: The additional resistance from a module (0.0 to 1.0)

### Formula Steps

1. **Calculate the lower bound:**
   $$
   \text{lowerBound} = \max(\text{MIN_LOWER_BOUND}, \text{baseResistance})
   $$
   where $\text{MIN_LOWER_BOUND} = 0.30$. The lower bound for diminishing returns is set to at least 30% (0.30).

2. **Set the upper bound:**
   $$
   \text{UPPER_BOUND} = 0.65
   $$
   The upper bound is 65% (0.65). This represents the maximum resistance that 100% multiplicative stacking would be compressed to.

3. **Calculate multiplicative stacking:**
   $$
   \text{stackedResistance} = 1 - (1 - \text{baseResistance}) \times (1 - \text{moduleResistance})
   $$
   This represents the resistance if modules stacked multiplicatively without diminishing returns.

4. **Apply diminishing returns:**
   $$
   \text{cappedResistance} = \text{lowerBound} + \frac{\text{stackedResistance} - \text{lowerBound}}{1 - \text{lowerBound}} \times (\text{UPPER_BOUND} - \text{lowerBound})
   $$
   This formula applies diminishing returns so that 100% stacking compresses to the upper bound. The stacked resistance is compressed into the range between `lowerBound` and `UPPER_BOUND`.

5. **Determine effective resistance:**
   $$
   \text{effectiveResistance} = \begin{cases}
   \text{cappedResistance} & \text{if } \text{cappedResistance} \geq \text{MIN_LOWER_BOUND} \\
   \text{stackedResistance} & \text{otherwise}
   \end{cases}
   $$
   Use the capped resistance if it's above the minimum lower bound, otherwise use the stacked resistance.

   **Note:** The 75% hard cap is not applied during individual module stacking. It is only applied once at the very end after all modules have been processed.

### Example Calculation

Let's say we have:
- `baseResistance = 0.40` (40%)
- `moduleResistance = 0.30` (30%)

**Step 1:** `lowerBound = max(0.30, 0.40) = 0.40`

**Step 2:** `UPPER_BOUND = 0.65`

**Step 3:** `stackedResistance = 1 - (1 - 0.40) × (1 - 0.30) = 1 - 0.60 × 0.70 = 1 - 0.42 = 0.58`

**Step 4:** `cappedResistance = 0.40 + (0.58 - 0.40) / (1 - 0.40) × (0.65 - 0.40)`
   - `= 0.40 + 0.18 / 0.60 × 0.25`
   - `= 0.40 + 0.30 × 0.25`
   - `= 0.40 + 0.075`
   - `= 0.475` (47.5%)

**Step 5:** Since `cappedResistance = 0.475 ≥ 0.30`, `effectiveResistance = 0.475` (47.5%)



## Module Processing

The resistance calculation processes modules in a specific order:

### 1. Base Resistance

The calculation starts with the base resistance from the **armor slot**:
$$
\text{shipResistance} = \text{armorResistance}
$$

### 2. Hull Reinforcement Packages

The system processes the following module types:
- Hull Reinforcement Package (HRP)
- Guardian Hull Reinforcement Package
- Meta Alloy Hull Reinforcement Package

### 3. Module Sorting Order

Modules are sorted by **Resistance value**: Lower resistance values are processed first (ascending order)

### 4. Special Bonus for High Resistance Modules

For each module, if the module's resistance exceeds 30%, it receives a **double bonus**:

$$
\text{adaptedModuleResistance} = \begin{cases}
\text{moduleResistance} \times 2.0 - 0.3 & \text{if } \text{moduleResistance} > 0.30 \\
\text{moduleResistance} & \text{otherwise}
\end{cases}
$$

**Example:**
- If `moduleResistance = 0.40` (40%), then `adaptedModuleResistance = 0.40 × 2.0 - 0.3 = 0.50` (50%)
- If `moduleResistance = 0.25` (25%), then `adaptedModuleResistance = 0.25` (no change)

### 5. Sequential Application

Each module is processed sequentially:
$$
\text{shipResistance}_{i+1} = \text{stackDamageResistance}(\text{shipResistance}_i, \text{adaptedModuleResistance}_i)
$$

Where $\text{shipResistance}_{0}$ is the base armor resistance.

### 6. Final Result

After **all** modules have been processed, the final resistance is capped at 75% and returned as a percentage:
$$
\text{finalResistance} = \min(0.75, \text{shipResistance}_{\text{final}}) \times 100\%
$$

## Complete Example

Let's calculate kinetic resistance for a ship with:
- Base armor kinetic resistance: 35% (0.35)
- HRP 1: 25% kinetic resistance (0.25) - processed first due to lower value
- HRP 2: 40% kinetic resistance (0.40)

**Initial:** `shipResistance = 0.35`

**Process HRP 1 (25%):**
- `adaptedModuleResistance = 0.25` (no bonus, ≤ 30%)
- `lowerBound = max(0.30, 0.35) = 0.35`
- `stackedResistance = 1 - (1 - 0.35) × (1 - 0.25) = 1 - 0.65 × 0.75 = 0.5125`
- `cappedResistance = 0.35 + (0.5125 - 0.35) / (1 - 0.35) × (0.65 - 0.35) = 0.35 + 0.1625 / 0.65 × 0.30 = 0.425`
- `effectiveResistance = 0.425` (since `cappedResistance ≥ 0.30`)
- `shipResistance = 0.425` (42.5%)

**Process HRP 2 (40%):**
- `adaptedModuleResistance = 0.40 × 2.0 - 0.3 = 0.50`
- `lowerBound = max(0.30, 0.425) = 0.425`
- `stackedResistance = 1 - (1 - 0.425) × (1 - 0.50) = 1 - 0.575 × 0.50 = 0.7125`
- `cappedResistance = 0.425 + (0.7125 - 0.425) / (1 - 0.425) × (0.65 - 0.425) = 0.425 + 0.2875 / 0.575 × 0.225 = 0.5375`
- `effectiveResistance = 0.5375` (since `cappedResistance ≥ 0.30`)
- `shipResistance = 0.5375` (53.75%)

**Apply final cap:** `finalResistance = min(0.75, 0.5375) = 0.5375` (53.75%)

**Final Result:** 53.75% kinetic resistance

## Key Properties

1. **Minimum Lower Bound**: The minimum lower bound for diminishing returns is 30% (MIN_LOWER_BOUND)
2. **Upper Bound**: The upper bound is 65% (UPPER_BOUND), representing the maximum resistance that 100% stacking would compress to
3. **Hard Cap**: The maximum effective resistance is hard capped at 75%, but this cap is **only applied once** at the very end after all modules have been processed, not during intermediate stacking operations
4. **Diminishing Returns**: Resistances are compressed into a range between the lower bound and upper bound, applying diminishing returns so that 100% stacking compresses to the upper bound
5. **High Resistance Bonus**: Modules with resistance > 30% receive a double bonus
6. **Sequential Processing**: Modules are processed one at a time, with each module's effect depending on the cumulative resistance from previous modules

## References

The formula is based on community research from the Elite: Dangerous forums:
- [Kinetic Resistance Calculation](https://forums.frontier.co.uk/threads/kinetic-resistance-calculation.266235/post-4230114)
- [Shield Booster Mod Calculator](https://forums.frontier.co.uk/threads/shield-booster-mod-calculator.286097/post-4998592)
