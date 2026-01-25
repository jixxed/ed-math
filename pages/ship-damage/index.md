---
layout: page
title: Ship Damage Calculation
description: "Mathematical explanation of how damage is calculated and applied to ships in Elite: Dangerous, including shields, hull, and modules."
author: CMDR Jixxed
date: 2026-01-23
modified_date: 2026-01-25
---

# Ship Damage Calculation

This document explains the mathematical formulas and mechanics used to calculate and apply damage to ships in Elite: Dangerous, based on official information from Frontier Developments.

## Overview

Elite: Dangerous uses a complex damage system that processes damage differently depending on whether it hits shields or hull. The system accounts for damage types, defenses, hardness, penetration mechanics, and module targeting.

## Damage Types

Elite: Dangerous uses **three primary damage types**:

1. **Thermic** - Thermal/energy damage
2. **Kinetic** - Physical/ballistic damage  
3. **Explosive** - Explosive damage

Additionally, there is a **fourth unmodifiable damage type** used only for collisions.

## Defences

Every object that can be damaged has **Defences** - a multiplier for each damage type:

- **Shields**: Take 120% damage from Thermic weapons, but are resistant to Kinetic and highly resistant to Explosive damage
- **Hull**: Base defences depend on armor type (e.g., Reactive and Mirrored armor adjust hull defences to different damage types)

## Shield Damage Process

When a shot hits a shield, the process is relatively simple:

1. **Multiply damage by shield defences** for the damage type
2. **Subtract health** from the shield
3. **Spillover damage**: If damage exceeds remaining shield health, the excess is applied to the hull (after hull defences are applied)

If the shield is not destroyed, damage stops at the shield.

## Hull Damage Process

When a shot hits the hull (or penetrates through shields), a much more complex multi-step process occurs:

### Step 1: Apply Armour Defences

The first step is to multiply the damage by the armour's defences for the damage type:

$$
\text{damageAfterDefences} = \text{baseDamage} \times \text{armourDefence}
$$

This works similarly to shields, where different armor types have different defence multipliers for each damage type.

### Step 2: Hardness Calculation

There's a second step in damage reduction that's used **only for hulls** - **Hardness**. Each armour has a Hardness value and each weapon has a Piercing value.

The damage is multiplied by:

$$
\text{hardnessMultiplier} = \min(1.0, \frac{\text{Piercing}}{\text{Hardness}})
$$

$$
\text{damageAfterHardness} = \text{damageAfterDefences} \times \text{hardnessMultiplier}
$$

**Examples:**
- A small pulse laser (Piercing = 20) vs. a Sidewinder (Hardness = 20): `min(1.0, 20/20) = 1.0` → Full damage
- A small pulse laser (Piercing = 20) vs. an Anaconda (Hardness = 65): `min(1.0, 20/65) ≈ 0.308` → Less than one-third damage

**Design Intent:** The main purpose of this mechanic is not to penalize small ships, but to make large weapons effective against large ships without one-shotting smaller vessels. Large weapons don't actually do that much more flat damage than small weapons, but by piercing much better, they are far more effective against harder targets.

### Step 3: Penetration Chance

Next, the system decides if the shot has **penetrated the armour**. This is a **random chance** that scales with current hull health.

- **Typical values**: 40% chance when you have full health, 80% when close to death
- The exact values vary per weapon type

**If the penetration roll fails:**
- All damage is dealt to the hull
- Skip to Step 8 (apply hull damage)
- No module damage occurs

**If the penetration roll succeeds:**
- Continue to Step 4 to check for module hits

### Step 4: Hit Layout - External Modules

Every ship has a **Hit Layout** of internal and external modules, represented as spheres:

- **Blue spheres**: External objects (modules that can be hit from outside)
- **Yellow spheres**: Internal objects (modules that require penetration)
- Some modules have **both** an internal and external sphere

![An Imperial Courier with its layout being debug rendered: blue spheres indicate external objects, yellow are internal - some modules have both an internal and external sphere. Note that all the directional thrusters used to be hittable objects and are shown in this overlay, but are currently turned off as they were causing confusion when a shot at the nose of the ship hit a thruster and damaged the engines unexpectedly.](image.png)


**External Module Check:**
If the hit point is inside an external (blue) sphere, then that module was hit directly. Skip to Step 7 (module damage).

**If no external module was hit:**
Continue to Step 5 to check internal modules.

### Step 5: Penetration Depth

If the shot has penetrated and not hit an external module, the system calculates how far the shot went into the ship.

Each ship defines a **standard penetration depth** (usually 75% of its height), which is then modified up and down by weapons.

**Special Case:** The railgun will go all the way through any ship currently in-game (but still can't hit a second ship).

**Note:** In build 1.3.07, there was a bug where penetration distance was much larger than intended, which was fixed in version 1.4.

### Step 6: Internal Module Ray Tracing

Given where the shot hit, the shot direction, and how far it penetrated, the system draws a **ray** through the ship's internal layout.

This ray is compared against all the internal (yellow) spheres:

- Any spheres that **intersect the ray** are candidates
- One module is picked at **random**, weighted by how dead-on the hit to its sphere was

**If nothing was hit:**
- Skip to Step 8 (apply hull damage)
- No module damage occurs

**If a module was hit:**
- Continue to Step 7 (module damage)

### Step 7: Module Damage

Whether the module was hit externally (Step 4) or internally (Step 6), the damage is now split between the hull and the module.

The **damage split ratio** is determined by the weapon type:
- Most weapons deal the **majority (80%+) to the module**
- The remainder goes to the hull

**Important Notes:**
- **No further defences are applied** at this point - the hull armour has already done its work in Step 1
- This applies even for external modules, as they're assumed to have toughened outer surfaces
- The module may also **malfunction** if it has taken enough damage

**Damage Split Formula:**

$$
\text{moduleDamage} = \text{damageAfterHardness} \times \text{weaponModuleRatio}
$$

$$
\text{hullDamage} = \text{damageAfterHardness} \times (1 - \text{weaponModuleRatio})
$$

Where `weaponModuleRatio` is typically 0.8 or higher for most weapons.

### Step 8: Apply Hull Damage

If no module was hit (penetration failed in Step 3, or no module intersected in Step 6), all damage is applied to the hull:

$$
\text{hullDamage} = \text{damageAfterHardness}
$$

## Complete Damage Flow Example

Let's trace a kinetic damage shot from a multicannon hitting an Anaconda:

**Initial Conditions:**
- Base damage: 5.0
- Weapon Piercing: 50
- Target: Anaconda with Reactive Composite Armour
- Armour Hardness: 65
- Armour Kinetic Defence: 0.85 (15% kinetic resistance)
- Hull health: 50% (penetration chance: ~60%)

**Step 1 - Apply Armour Defences:**
- `damageAfterDefences = 5.0 × 0.85 = 4.25`

**Step 2 - Hardness Calculation:**
- `hardnessMultiplier = min(1.0, 50/65) = min(1.0, 0.769) = 0.769`
- `damageAfterHardness = 4.25 × 0.769 ≈ 3.27`

**Step 3 - Penetration Chance:**
- Roll: 60% chance → **Success** (penetration occurs)

**Step 4 - External Module Check:**
- Hit point checked against external module spheres
- **No external module hit**

**Step 5 - Penetration Depth:**
- Standard depth: 75% of ship height
- Weapon modifier applied
- Ray drawn through ship interior

**Step 6 - Internal Module Ray Tracing:**
- Ray intersects Power Plant sphere
- **Power Plant selected** (weighted by hit accuracy)

**Step 7 - Module Damage:**
- Weapon module ratio: 0.85 (85% to module, 15% to hull)
- `moduleDamage = 3.27 × 0.85 ≈ 2.78` → Applied to Power Plant
- `hullDamage = 3.27 × 0.15 ≈ 0.49` → Applied to hull

**Result:**
- Power Plant takes 2.78 damage
- Hull takes 0.49 damage
- Power Plant may malfunction if damage threshold exceeded

## Key Properties

1. **Damage Type Matters**: Different damage types have different effectiveness against shields vs. hull
2. **Hardness is Critical**: Small weapons are severely penalized against high-hardness targets
3. **Penetration is Random**: Lower hull health increases penetration chance
4. **Module Targeting**: External modules can be hit directly; internal modules require penetration and ray tracing
5. **Damage Splitting**: Most damage goes to modules when they're hit, not the hull
6. **No Double Defences**: Module damage doesn't get additional defence reductions beyond the initial armour defences

## Historical Notes

- **Build 1.3.07**: Had a bug where penetration distance was much larger than intended
- **Build 1.4**: Fixed the penetration distance bug
- **Directional Thrusters**: Used to be hittable objects but were turned off as they caused confusion when shots at the nose of a ship would hit a thruster and damage the engines unexpectedly

## References

This documentation is based on official information from Frontier Developments:

- [Discussion with Mark Allen on damage and defenses](https://web.archive.org/web/20151009025620/https://forums.frontier.co.uk/showthread.php?t=170205) - Original forum post by Mark Allen (Frontier Employee) from July 28, 2015
