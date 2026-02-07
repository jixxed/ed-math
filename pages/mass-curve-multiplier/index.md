---
layout: page
title: Mass Curve Multiplier Calculation
description: "Mathematical explanation of how mass curve multipliers are calculated for thrusters and shields in Elite: Dangerous."
author: CMDR Jixxed
date: 2026-02-07
modified_date: 2026-02-07
---

This document explains the mathematical formula used to calculate mass curve multipliers for thrusters and shields in Elite: Dangerous. These multipliers determine how module performance scales with ship mass.

## Overview

The mass curve multiplier formula is used by thrusters and shields to adjust their performance based on the ship's mass. It creates a smooth curve that provides optimal performance at a specific mass range, with diminishing returns as the mass deviates from the optimal range.

## Formula

The mass curve multiplier is calculated using the following formula:

$$
\text{multiplier} = \text{minimumMultiplier} + \text{powerTerm} \times (\text{maximumMultiplier} - \text{minimumMultiplier})
$$

Where the power term is:

$$
\text{powerTerm} = \min\left(1.0, \frac{\text{maximumMass} - \text{mass}}{\text{maximumMass} - \text{minimumMass}}\right)^{\text{exponent}}
$$

And the exponent is:

$$
\text{exponent} = \frac{\ln\left(\frac{\text{optimalMultiplier} - \text{minimumMultiplier}}{\text{maximumMultiplier} - \text{minimumMultiplier}}\right)}{\ln\left(\frac{\text{maximumMass} - \text{optimalMass}}{\text{maximumMass} - \text{minimumMass}}\right)}
$$

## Parameters

The formula uses the following parameters from thruster and shield modules:

- **mass**: The current ship mass in tons
- **minimumMass**: The minimum mass at which the module operates
- **maximumMass**: The maximum mass at which the module operates
- **optimalMass**: The mass at which the module performs optimally
- **minimumMultiplier**: The performance multiplier at minimum mass
- **maximumMultiplier**: The performance multiplier at maximum mass
- **optimalMultiplier**: The performance multiplier at optimal mass

## Formula Breakdown

### Step 1: Mass Normalization

First, the mass is normalized to a value between 0 and 1:

$$
\text{massRatio} = \frac{\text{maximumMass} - \text{mass}}{\text{maximumMass} - \text{minimumMass}}
$$

This ratio is then clamped to a maximum of 1.0:

$$
\text{clampedMassRatio} = \min(1.0, \text{massRatio})
$$

### Step 2: Exponent Calculation

The exponent determines the shape of the power curve. It's calculated using logarithmic interpolation to ensure the curve passes through the optimal point:

$$
\text{exponent} = \frac{\ln\left(\frac{\text{optimalMultiplier} - \text{minimumMultiplier}}{\text{maximumMultiplier} - \text{minimumMultiplier}}\right)}{\ln\left(\frac{\text{maximumMass} - \text{optimalMass}}{\text{maximumMass} - \text{minimumMass}}\right)}
$$

### Step 3: Power Term Calculation

The power term applies the exponential curve to the normalized mass:

$$
\text{powerTerm} = \text{clampedMassRatio}^{\text{exponent}}
$$

### Step 4: Final Multiplier

Finally, the power term is scaled and offset to produce the final multiplier:

$$
\text{multiplier} = \text{minimumMultiplier} + \text{powerTerm} \times (\text{maximumMultiplier} - \text{minimumMultiplier})
$$

## Visual representation

This is what the mass curve multplier looks like for a module with the following parameters:
- minimumMultiplier = 96
- optimalMultiplier = 100
- maximumMultiplier = 116
- minimumMass = 1080
- optimalMass = 2160
- maximumMass = 3240

```vega
{
	"$schema": "https://vega.github.io/schema/vega/v5.json",
	"width": 800,
	"height": 600,
	"title": {"text": "Mass curve multiplier for 7A Thrusters","font": "Inter, system-ui, sans-serif","fontSize": 20,"fontWeight": "bold","color": "#888","offset": 10},
	"data":{"name":"resistance_data","format":{"type":"csv"},"url":"mcm_values.csv"},
	"scales": [
		{"name": "xscale","type": "linear","domain": [1080.0,3240.0],"zero": false,"range": "width"},
		{"name": "yscale","type": "linear","domain": [90.0,120.0],"zero": false,"range": "height"}
	],
	"axes": [
		{"scale": "xscale","orient": "bottom","title": "Ship mass","labelColor": "#888","titleColor": "#888","labelFontSize": 12,"titleFontSize": 14,"grid": true,"gridColor": "#888"},
		{"scale": "yscale","orient": "left","title": "Mass curve multiplier (%)","labelColor": "#888","titleColor": "#888","labelFontSize": 12,"titleFontSize": 14,"grid": true,"gridColor": "#888"}
	],
	"marks": [
		{"type": "line","from": {"data": "resistance_data"},"encode": {"enter": {"x": {"scale": "xscale","field": "x"},"y": {"scale": "yscale","field": "mcm"},"stroke": {"value": "orange"},"strokeWidth": {"value": 2}}}}
	]
}
```

## Example Calculation

For a thruster module with the following parameters:
- mass = 400 tons
- minimumMass = 100 tons
- maximumMass = 800 tons
- optimalMass = 200 tons
- minimumMultiplier = 0.5
- maximumMultiplier = 1.2
- optimalMultiplier = 1.0

**Step 1 - Mass Normalization:**

$$
\text{massRatio} = \frac{800 - 400}{800 - 100} = \frac{400}{700} \approx 0.571
$$
$$
\text{clampedMassRatio} = \min(1.0, 0.571) = 0.571
$$

**Step 2 - Exponent Calculation:**

$$
\text{exponent} = \frac{\ln\left(\frac{1.0 - 0.5}{1.2 - 0.5}\right)}{\ln\left(\frac{800 - 200}{800 - 100}\right)} = \frac{\ln\left(\frac{0.5}{0.7}\right)}{\ln\left(\frac{600}{700}\right)} = \frac{\ln(0.714)}{\ln(0.857)} \approx \frac{-0.336}{-0.154} \approx 2.18
$$

**Step 3 - Power Term:**

$$
\text{powerTerm} = 0.571^{2.18} \approx 0.295
$$

**Step 4 - Final Multiplier:**

$$
\text{multiplier} = 0.5 + 0.295 \times (1.2 - 0.5) = 0.5 + 0.295 \times 0.7 \approx 0.5 + 0.206 = 0.706
$$

## Key Properties

1. **Optimal Performance**: The curve is designed to pass through the optimal multiplier at the optimal mass
2. **Bounded Output**: The result is always between the minimum and maximum multipliers
3. **Smooth Transition**: The logarithmic exponent ensures smooth transitions between mass ranges
4. **Mass Clamping**: When mass is below minimumMass, the multiplier equals maximumMultiplier
5. **Diminishing Returns**: Performance degrades more as mass increases

## Mathematical Behavior

- When **mass = minimumMass**: The multiplier equals **maximumMultiplier**
- When **mass = optimalMass**: The multiplier equals **optimalMultiplier**
- When **mass = maximumMass**: The multiplier equals **minimumMultiplier**

