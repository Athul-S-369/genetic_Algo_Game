# Genetic Algorithm Game

A Python-based visualization of genetic algorithms where individuals evolve to collect targets efficiently. This project demonstrates the principles of genetic algorithms through an interactive simulation.

## Features

- **Visual Simulation**: Watch individuals evolve and adapt their behavior in real-time
- **Genetic Evolution**: Implements crossover, mutation, and selection mechanisms
- **Interactive Environment**: Individuals navigate to collect targets
- **Performance Tracking**: Shows generation count, time remaining, and best scores
- **Trail Visualization**: See the path each individual takes with fading trails

## Requirements

- Python 3.x
- Pygame

## Installation

1. Clone or download this repository
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## How to Run

Execute the main script to start the simulation:
```bash
python main.py
```

## How It Works

### Individual Behavior
Each individual in the population has the following characteristics:
- Position (x, y)
- Movement speed
- Direction angle
- Size
- Color
- Trail visualization

### Genetic Algorithm Components

1. **Population**: Multiple individuals competing to collect targets
2. **Fitness**: Measured by the number of targets collected
3. **Selection**: Tournament selection to choose parents for the next generation
4. **Crossover**: Combining genes from two parents to create offspring
5. **Mutation**: Random changes to maintain genetic diversity

### Simulation Parameters

- Population Size: 20 individuals
- Mutation Rate: 10%
- Target Count: 5 targets per generation
- Generation Time: 10 seconds

## Project Structure

- `main.py`: Main game loop and simulation control
- `genetic_algo.py`: Implementation of genetic algorithm components
- `requirements.txt`: Project dependencies

## Visualization Features

- Individuals leave trails as they move
- Targets are displayed as red circles
- Each individual shows its current score
- Real-time statistics display (generation, time, best score)