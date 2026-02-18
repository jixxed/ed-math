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
\text{multiplier} = clamp\left(\text{minMultiplier} + \text{powerTerm} \times (\text{maxMultiplier} - \text{minMultiplier}), \text{minMultiplier}, \text{maxMultiplier}\right)
$$

Where the power term is:

$$
\text{powerTerm} = clamp\left(\frac{\text{maximumMass} - \text{mass}}{\text{maximumMass} - \text{minimumMass}}, 0, 1\right)^{\text{exponent}}
$$

And the exponent is:

$$
\text{exponent} = \frac{\text{numerator}}{\text{denominator}}
$$

Where the numerator and denominator are calculated as follows:

$$
\text{numerator} = {\ln\left(\frac{\text{optMultiplier} - \text{minMultiplier}}{\text{maxMultiplier} - \text{minMultiplier}}\right)}
$$

$$
\text{denominator} = \ln\left(\frac{\text{maximumMass} - \text{optimalMass}}{\text{maximumMass} - \text{minimumMass}}\right)
$$

$$
\text{denominator} = \begin{cases}
\text{-EPSILON} & \text{if } \text{denominator} = 0.0 \\
\text{denominator} & \text{otherwise}
\end{cases}
$$

## Parameters

The formula uses the following parameters from thruster and shield modules:

- **mass**: The current ship mass in tons
- **minimumMass**: The minimum mass at which the module operates
- **maximumMass**: The maximum mass at which the module operates
- **optimalMass**: The mass at which the module performs optimally
- **minMultiplier**: The performance multiplier at minimum mass
- **maxMultiplier**: The performance multiplier at maximum mass
- **optMultiplier**: The performance multiplier at optimal mass

## Formula Breakdown

### Step 1: Mass Normalization

First, the mass is normalized to a value between 0 and 1:

$$
\text{massRatio} = \frac{\text{maximumMass} - \text{mass}}{\text{maximumMass} - \text{minimumMass}}
$$

This ratio is then clamped between a value of 0 and 1, because even though there are safeguards in the game, it is possible to exceed minimum and maximum mass:

$$
\text{clampedMassRatio} = clamp(\text{massRatio}, 0 , 1)
$$

### Step 2: Exponent Calculation

The exponent determines the shape of the power curve. It's calculated using logarithmic interpolation to ensure the curve passes through the optimal point.


First, calculate the logarithm term:

$$
\text{numerator} = {\ln\left(\frac{\text{optMultiplier} - \text{minMultiplier}}{\text{maxMultiplier} - \text{minMultiplier}}\right)}
$$

$$
\text{denominator} = \ln\left(\frac{\text{maximumMass} - \text{optimalMass}}{\text{maximumMass} - \text{minimumMass}}\right)
$$

$$
\text{denominator} = \begin{cases}
\text{-EPSILON} & \text{if } \text{denominator} = 0.0 \\
\text{denominator} & \text{otherwise}
\end{cases}
$$

Then calculate the exponent:

$$
\text{exponent} = \frac{\text{numerator}}{\text{denominator}}
$$
### Step 3: Power Term Calculation

The power term applies the exponential curve to the normalized mass:

$$
\text{powerTerm} = \text{clampedMassRatio}^{\text{exponent}}
$$

### Step 4: Final Multiplier

Finally, the power term is scaled and offset to produce the final multiplier, which is then clamped to ensure it stays within the valid range:

$$
\text{multiplier} = clamp\left(\text{minMultiplier} + \text{powerTerm} \times (\text{maxMultiplier} - \text{minMultiplier}), \text{minMultiplier}, \text{maxMultiplier}\right)
$$

## Visual representation

This is what the mass curve multiplier looks like for a module with the following parameters:
- minMultiplier = 96
- optMultiplier = 100
- maxMultiplier = 116
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
		{"name": "xscale","type": "linear","domain": [500.0,4000.0],"zero": false,"range": "width"},
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
This is what the mass curve multiplier looks like for the Mk II Agile thruster module which has the following parameters:
- minMultiplier = 96
- optMultiplier = 100
- maxMultiplier = 116
- minimumMass = 420
- optimalMass = 420
- maximumMass = 1260

```vega
{
	"$schema": "https://vega.github.io/schema/vega/v5.json",
	"width": 800,
	"height": 600,
	"title": {"text": "Mass curve multiplier for 5A Mk II Agile Thrusters","font": "Inter, system-ui, sans-serif","fontSize": 20,"fontWeight": "bold","color": "#888","offset": 10},
	"data":{"name":"resistance_data","format":{"type":"csv"},"url":"mcm_mk2_values.csv"},
	"scales": [
		{"name": "xscale","type": "linear","domain": [300.0,600.0],"zero": false,"range": "width"},
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
- minMultiplier = 0.5
- maxMultiplier = 1.2
- optMultiplier = 1.0

**Step 1 - Mass Normalization:**

$$
\text{massRatio} = \frac{800 - 400}{800 - 100} = \frac{400}{700} \approx 0.571
$$
$$
\text{clampedMassRatio} = clamp(0.571, 0, 1) = 0.571
$$

**Step 2 - Exponent Calculation:**

$$
\text{numerator} = \ln\left(\frac{1.0 - 0.5}{1.2 - 0.5}\right) = \ln\left(\frac{0.5}{0.7}\right) = \ln(0.714\ldots) \approx -0.336
$$

$$
\text{denominator} = \ln\left(\frac{800 - 200}{800 - 100}\right) = \ln\left(\frac{600}{700}\right) = \ln(0.857\ldots) \approx -0.154
$$

Since the denominator is not zero, we use it as-is:

$$
\text{exponent} = \frac{\text{numerator}}{\text{denominator}} \approx \frac{-0.336}{-0.154} \approx 2.18
$$

**Step 3 - Power Term:**

$$
\text{powerTerm} = 0.571^{2.18} \approx 0.295
$$

**Step 4 - Final Multiplier:**

$$
\text{multiplier} = clamp(0.5 + 0.295 \times (1.2 - 0.5), 0.5, 1.2) = clamp(0.5 + 0.295 \times 0.7, 0.5, 1.2) = clamp(0.706, 0.5, 1.2) = 0.706
$$

## Key Properties

1. **Optimal Performance**: The curve is designed to pass through the optimal multiplier at the optimal mass
2. **Bounded Output**: The result is always between the minimum and maximum multipliers
3. **Smooth Transition**: The logarithmic exponent ensures smooth transitions between mass ranges
4. **Mass Clamping**: When mass is below minimumMass, the multiplier equals maxMultiplier. When mass is above maximumMass, the multiplier equals minMultiplier
5. **Diminishing Returns**: Performance degrades more as mass increases

## Conclusion

It is possible to equip modules below the minimum mass, but the performance will be capped at the maximum multiplier.
Equipping modules above the maximum mass will result in a significant performance penalty, as the multiplier will be capped at the minimum multiplier.

Only through swapping experimental effects is it possible to equip modules above the maximum mass, but this has limited practical benefits.
One such case it to build a maximum jump range ship for setting world records. The game blocks all other module changes that would exceed the maximum mass.

## Mathematical Behavior

- When **mass <= minimumMass**: The multiplier equals **maxMultiplier**
- When **mass = optimalMass**: The multiplier equals **optMultiplier**
- When **mass >= maximumMass**: The multiplier equals **minMultiplier**

