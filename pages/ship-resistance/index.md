---
layout: page
title: Ship Resistance Calculation
description: "Mathematical explanation of how damage resistance is calculated for ship armour and hull reinforcement packages in Elite: Dangerous."
author: CMDR Jixxed
date: 2026-01-23
modified_date: 2026-01-26
---
This document explains the mathematical formulas used to calculate effective damage resistance for ships in Elite: Dangerous, specifically for armour and hull reinforcement packages.

## Overview

The resistance calculation system stacks resistances sequentially, applies a doubling bonus for high resistance modules, and a halving penalty when crossing a threshold.

## Core Formula: Stack Damage Resistance

The heart of the calculation is the `stackDamageResistance` function. It diminishes the stacked resistance if the resulting resistance crosses the 30% barrier.

### Parameters

- **currentResistance**: The current resistance value
- **moduleResistance**: The additional resistance from a module

### Constants

- **MIN_LOWER_BOUND**: 0.30. The lower bound for the `cappedResistance` formula is set to at least 30%.
- **UPPER_BOUND**: 0.65. The upper bound for the `cappedResistance` formula is set to at least 65%.

### Formula Steps

1. **Calculate the lower bound:**

   $$
   \text{lowerBound} = \max(\text{MIN_LOWER_BOUND}, \text{currentResistance})
   $$

2. **Calculate multiplicative stacking:**

   $$
   \text{stackedResistance} = 1 - (1 - \text{currentResistance}) \times (1 - \text{moduleResistance})
   $$
   
   This represents the resistance if modules stacked multiplicatively.

3. **Capped resistance calculation:**

   $$
   \text{cappedResistance} = \text{lowerBound} + \frac{\text{stackedResistance} - \text{lowerBound}}{1 - \text{lowerBound}} \times (\text{UPPER_BOUND} - \text{lowerBound})
   $$

   This formula is an alternative calculation. It has higher gains until the `effectiveResistance` hits 30%, after which it will have lower gains than `stackedResistance` and that gap will increase until the `currentResistance` hits 30%. 
   After that the gap will stay the same. This basically means that a stack going over 30% will be penalized by halving the portion going over 30%. This formula does not penalize positive stacks with a `currentResistance` over 30%.
   Negative stacks that cross the 30% border are more heavily penalized. This is further clarified with graphs below.

4. **Determine effective resistance:**

   $$
   \text{effectiveResistance} = \begin{cases}
   \text{cappedResistance} & \text{if } \text{cappedResistance} \geq \text{MIN_LOWER_BOUND} \\
   \text{stackedResistance} & \text{otherwise}
   \end{cases}
   $$

   Use the `cappedResistance` if it's above the `MIN_LOWER_BOUND`, otherwise use the `stackedResistance`.

   **Note:** The 75% hard cap is not applied during individual module stacking. It is only applied once at the very end after all modules have been processed.

   **Visualization**

   Below is a plot showing how the `effectiveResistance` changes with different base resistances when adding a module with 60% resistance. It shows values you would get from the stacked and the capped formulas and the value you will effectively get, which is always the worst of both formulas. 
   
   It also shows the gains you would get from adding the module compared to the base resistance. This shows that at 65% base resistance, adding a positive resistance module results in a negative gain! This is the "funny hull" mechanic, and is still very much active.
   ```vega
   {
       "$schema":"https://vega.github.io/schema/vega/v5.json",
       "width":800,
       "height":600,
       "title":{"text":"Resistance value when adding a 60.0% Module","font":"Inter, system-ui, sans-serif","fontSize":20,"fontWeight":"bold","color":"#888","offset":10},
       "data":{"name":"resistance_data","format":{"type":"csv"},"url":"60p_data.csv"},
       "scales":[
           {"name":"xscale","type":"linear","domain":[-200,200],"range":"width"},
           {"name":"yscale","type":"linear","domain":[-81,180],"range":"height"},
           {"name":"color","type":"ordinal","domain":["Capped Resistance","Stacked Resistance","Final Effective Resistance","Gains","30% line"],"range":["orange","red","green","cyan","purple"]}
       ],
       "axes":[
           {"scale":"xscale","orient":"bottom","title":"Starting Resistance (%)","labelColor":"#888","titleColor":"#888","labelFontSize":12,"titleFontSize":14,"grid": true,"gridColor":"#888"},
           {"scale":"yscale","orient":"left","title":"Effective resistance (%)","labelColor":"#888","titleColor":"#888","labelFontSize":12,"titleFontSize":14,"grid": true,"gridColor":"#888"}
       ],
       "legends":[
           {
               "stroke":"color",
               "title":"Legend",
               "orient":"top-left",
               "encode":{
                   "symbols":{"update":{"shape":{"value":"stroke"},"strokeWidth":{"value":1.5},"strokeDash":[{"test":"datum.label === 'Final Effective Resistance'","value":[2,2]},{"test":"datum.label === '30% line'","value":[2,2]},{"value":[]}]}},
                   "labels":{"update":{"fontSize":{"value":12},"fill":{"value":"#888"}}},
                   "title":{"update":{"fontSize":{"value":14},"fill":{"value":"#888"},"fontWeight":{"value":"bold"}}}
               }
           }
       ],
       "marks":[
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"capped"},"stroke":{"value":"orange"},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"stacked"},"stroke":{"value":"red"},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"final"},"stroke":{"value":"green"},"strokeDash":{"value":[4,4]},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"gains"},"stroke":{"value":"cyan"},"strokeWidth":{"value":4}}}},
           {"type":"rule","encode":{"enter":{"x":{"scale":"xscale","value":30},"y":{"value":0},"y2":{"field":{"group":"height"}},"stroke":{"value":"purple"},"strokeDash":{"value":[2,2]}}}},
           {"type":"rule","encode":{"enter":{"y":{"scale":"yscale","value":30},"x":{"value":0},"x2":{"field":{"group":"width"}},"stroke":{"value":"purple"},"strokeDash":{"value":[2,2]}}}}
       ]
   }
   ```

   Similarly, here is a plot for when adding a module with -60% resistance (negative resistance). It shows how the `effectiveResistance` changes with different base resistances. Interestingly, negative resistances has a less negative effect on higher base values up until the `effectiveResistance` goes below 30%.
   
   It also shows the losses you would get from adding the module compared to the base resistance. This shows that at 65% base resistance, adding a negative resistance module results in a positive gain! This is the "funny hull" mechanic, and is still very much active.
   ```vega
   {
       "$schema":"https://vega.github.io/schema/vega/v5.json",
       "width":800,
       "height":600,
       "title":{"text":"Resistance value when adding a -60.0% Module","font":"Inter, system-ui, sans-serif","fontSize":20,"fontWeight":"bold","color":"#888","offset":10},
       "data":{"name":"resistance_data","format":{"type":"csv"},"url":"-60p_data.csv"},
       "scales":[
           {"name":"xscale","type":"linear","domain":[-200,200],"range":"width"},
           {"name":"yscale","type":"linear","domain":[-380,281],"range":"height"},
           {"name":"color","type":"ordinal","domain":["Capped Resistance","Stacked Resistance","Final Effective Resistance","Gains","30% line"],"range":["orange","red","green","cyan","purple"]}
       ],
       "axes":[
           {"scale":"xscale","orient":"bottom","title":"Starting Resistance (%)","labelColor":"#888","titleColor":"#888","labelFontSize":12,"titleFontSize":14,"grid": true,"gridColor":"#888"},
           {"scale":"yscale","orient":"left","title":"Effective resistance (%)","labelColor":"#888","titleColor":"#888","labelFontSize":12,"titleFontSize":14,"grid": true,"gridColor":"#888"}
       ],
       "legends":[
           {
               "stroke":"color",
               "title":"Legend",
               "orient":"top-left",
               "encode":{
                   "symbols":{"update":{"shape":{"value":"stroke"},"strokeWidth":{"value":1.5},"strokeDash":[{"test":"datum.label === 'Final Effective Resistance'","value":[2,2]},{"test":"datum.label === '30% line'","value":[2,2]},{"value":[]}]}},
                   "labels":{"update":{"fontSize":{"value":12},"fill":{"value":"#888"}}},
                   "title":{"update":{"fontSize":{"value":14},"fill":{"value":"#888"},"fontWeight":{"value":"bold"}}}
               }
           }
       ],
       "marks":[
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"capped"},"stroke":{"value":"orange"},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"stacked"},"stroke":{"value":"red"},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"final"},"stroke":{"value":"green"},"strokeDash":{"value":[4,4]},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"gains"},"stroke":{"value":"cyan"},"strokeWidth":{"value":4}}}},
           {"type":"rule","encode":{"enter":{"x":{"scale":"xscale","value":30},"y":{"value":0},"y2":{"field":{"group":"height"}},"stroke":{"value":"purple"},"strokeDash":{"value":[2,2]}}}},
           {"type":"rule","encode":{"enter":{"y":{"scale":"yscale","value":30},"x":{"value":0},"x2":{"field":{"group":"width"}},"stroke":{"value":"purple"},"strokeDash":{"value":[2,2]}}}}
       ]
   }
   ```

   Finally, this is what it looks like with a 0% module, which results in no change for the `effectiveResistance` compared to the base resistance, as expected. It is interesting to see how the capped and stacked formulas behave depending on the module resistance value.

   ```vega
   {
       "$schema":"https://vega.github.io/schema/vega/v5.json",
       "width":800,
       "height":600,
       "title":{"text":"Resistance value when adding a 0.0% Module","font":"Inter, system-ui, sans-serif","fontSize":20,"fontWeight":"bold","color":"#888","offset":10},
       "data":{"name":"resistance_data","format":{"type":"csv"},"url":"0p_data.csv"},
       "scales":[
           {"name":"xscale","type":"linear","domain":[-200,200],"range":"width"},
           {"name":"yscale","type":"linear","domain":[-200,200],"range":"height"},
           {"name":"color","type":"ordinal","domain":["Capped Resistance","Stacked Resistance","Final Effective Resistance","Gains","30% line"],"range":["orange","red","green","cyan","purple"]}
       ],
       "axes":[
           {"scale":"xscale","orient":"bottom","title":"Starting Resistance (%)","labelColor":"#888","titleColor":"#888","labelFontSize":12,"titleFontSize":14,"grid": true,"gridColor":"#888"},
           {"scale":"yscale","orient":"left","title":"Effective resistance (%)","labelColor":"#888","titleColor":"#888","labelFontSize":12,"titleFontSize":14,"grid": true,"gridColor":"#888"}
       ],
       "legends":[
           {
               "stroke":"color",
               "title":"Legend",
               "orient":"top-left",
               "encode":{
                   "symbols":{"update":{"shape":{"value":"stroke"},"strokeWidth":{"value":1.5},"strokeDash":[{"test":"datum.label === 'Final Effective Resistance'","value":[2,2]},{"test":"datum.label === '30% line'","value":[2,2]},{"value":[]}]}},
                   "labels":{"update":{"fontSize":{"value":12},"fill":{"value":"#888"}}},
                   "title":{"update":{"fontSize":{"value":14},"fill":{"value":"#888"},"fontWeight":{"value":"bold"}}}
               }
           }
       ],
       "marks":[
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"capped"},"stroke":{"value":"orange"},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"stacked"},"stroke":{"value":"red"},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"final"},"stroke":{"value":"green"},"strokeDash":{"value":[4,4]},"strokeWidth":{"value":4}}}},
           {"type":"line","from":{"data":"resistance_data"},"encode":{"enter":{"x":{"scale":"xscale","field":"x"},"y":{"scale":"yscale","field":"gains"},"stroke":{"value":"cyan"},"strokeWidth":{"value":4}}}},
           {"type":"rule","encode":{"enter":{"x":{"scale":"xscale","value":30},"y":{"value":0},"y2":{"field":{"group":"height"}},"stroke":{"value":"purple"},"strokeDash":{"value":[2,2]}}}},
           {"type":"rule","encode":{"enter":{"y":{"scale":"yscale","value":30},"x":{"value":0},"x2":{"field":{"group":"width"}},"stroke":{"value":"purple"},"strokeDash":{"value":[2,2]}}}}
       ]
   }
   ```

### Example Calculation

Let's say we have:
- `currentResistance = 0.40` (40%)
- `moduleResistance = 0.30` (30%)

**Step 1:**

    lowerBound = max(0.30, 0.40)
               = 0.40

**Step 2:** 

    stackedResistance = 1 - (1 - 0.40) × (1 - 0.30)
                      = 1 - 0.60 × 0.70
                      = 1 - 0.42
                      = 0.58 (58%)

**Step 3:** 

    cappedResistance = 0.40 + (0.58 - 0.40) / (1 - 0.40) × (0.65 - 0.40)
                     = 0.40 + 0.18 / 0.60 × 0.25
                     = 0.40 + 0.30 × 0.25
                     = 0.40 + 0.075
                     = 0.475 (47.5%)

**Step 4:** 

Since `cappedResistance = 0.475 ≥ 0.30`, `effectiveResistance = 0.475` (47.5%)



## Module Processing

The resistance calculation processes modules in a specific order:

### 1. Base Resistance

The calculation starts with the resistance from the **armour slot**, including engineering:

$$
\text{shipResistance}_{0} = \text{armourResistance}
$$

### 2. Hull Reinforcement Packages

The system processes the following module types:
- Hull Reinforcement Package (HRP)
- Guardian Hull Reinforcement Package
- Meta Alloy Hull Reinforcement Package

### 3. Module Sorting Order

Modules are sorted by **Resistance value**: Lower resistance values are processed first (ascending order)
Each resistance type is processed individually and will therefore have its own ordering of all the modules.

### 4. Special Bonus for High Resistance Modules

For each module, if the module's resistance exceeds 30%, it receives a **doubling bonus** for the portion exceeding 30%:

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

Where $\text{shipResistance}_{0}$ is the ships armour resistance, including any engineering.

### 6. Final Result

After **all** modules have been processed, the final resistance is capped at 75% and returned as a percentage:

$$
\text{finalResistance} = \min(0.75, \text{shipResistance}_{\text{final}}) \times 100\%
$$

## Complete Example

Let's calculate kinetic resistance for a ship with:
- Base armour kinetic resistance: 35% (0.35)
- HRP 1: 25% kinetic resistance (0.25) - processed first due to lower value
- HRP 2: 40% kinetic resistance (0.40)

**Initial:** `shipResistance = 0.35`

**Process HRP 1 (25%):**

    adaptedModuleResistance = 0.25 (no bonus, ≤ 30%)

    lowerBound = max(0.30, 0.35) 
               = 0.35

    stackedResistance = 1 - (1 - 0.35) × (1 - 0.25) 
                      = 1 - 0.65 × 0.75 
                      = 0.5125

    cappedResistance = 0.35 + (0.5125 - 0.35) / (1 - 0.35) × (0.65 - 0.35) 
                     = 0.35 + 0.1625 / 0.65 × 0.30 
                     = 0.425

    effectiveResistance = 0.425 (since cappedResistance ≥ 0.30)

    shipResistance = 0.425 (42.5%)

**Process HRP 2 (40%):**

    adaptedModuleResistance = 0.40 × 2.0 - 0.3 
                            = 0.50

    lowerBound = max(0.30, 0.425) 
               = 0.425

    stackedResistance = 1 - (1 - 0.425) × (1 - 0.50) 
                      = 1 - 0.575 × 0.50 
                      = 0.7125

    cappedResistance = 0.425 + (0.7125 - 0.425) / (1 - 0.425) × (0.65 - 0.425) 
                     = 0.425 + 0.2875 / 0.575 × 0.225 
                     = 0.5375

    effectiveResistance = 0.5375 (since cappedResistance ≥ 0.30)

    shipResistance = 0.5375 (53.75%)

**Apply final cap:** `finalResistance = min(0.75, 0.5375) = 0.5375` (53.75%)

**Final Result:** 53.75% kinetic resistance

## Key Properties

1. **Soft Cap**: The maximum effective resistance is soft capped at 65%. If your starting resistance is below 65%, you will be unable to exceed this, because modules are processed low to high, and to break this you would need to process lower resistance modules after higher ones.
2. **Hard Cap**: The maximum effective resistance is hard capped at 75%, but this cap is **only applied once** at the very end after all modules have been processed, not during intermediate stacking operations. You can reach this with negative resistance stacking and a base resistance over 65%. 
3. **High Resistance Bonus**: Modules with resistance > 30% receive a doubling bonus
4. **Penalty Border**: Crossing the 30% resistance threshold affects both positive and negative resistances, with diminished gains above 30% and increased penalties below 30%
5. **Sequential Processing**: Modules are processed one at a time, with each module's effect depending on the cumulative resistance from previous modules
6. **Funny hull mechanic**: The funny hull mechanic is still very much active, where you use negative resistance modules to increase your resistance when you are above 65%.

## Conclusion

It is generally more beneficial to use resistance specific engineering on modules. blast/thermal/kinetic resistant can get up to 42.7% that results in 55.4% due to the bonus.

The funny hull mechanic is still very much active, so using negative resistance modules when you are above 65% resistance can yield a higher resistance. Combining this with a
high resistance module for a different resistance type will yield an increase in 2 resistance types.

Crossing the 30% border has an impact on the effectiveness of module being stacked, so careful planning of module selection can maximize resistance yields. To minimize losses, you want your stack to end as closely on either side of the 30% border as possible.

## References

The original formula is based on community research from the Elite: Dangerous forums:
- [Kinetic Resistance Calculation](https://forums.frontier.co.uk/threads/kinetic-resistance-calculation.266235/post-4230114)
- [Shield Booster Mod Calculator](https://forums.frontier.co.uk/threads/shield-booster-mod-calculator.286097/post-4998592)

The new formula was determined by CMDR Jixxed in January 2026 based on empirical testing and analysis of in-game resistance values, with assistance of CMDR Shea providing test cases.