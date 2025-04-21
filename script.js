class Individual {
    constructor() {
        this.genes = {
            x: Math.random() * 100,  // position x
            y: Math.random() * 100,  // position y
            speed: Math.random() * 5, // movement speed
            angle: Math.random() * 360, // movement direction
            size: Math.random() * 3 + 1 // size affects both visual and collision
        };
        this.fitness = 0;
        this.element = null;
        this.trail = [];
        this.collectedTargets = 0;
    }

    createVisualElement() {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        const size = this.genes.size * 5;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;

        // Color based on fitness (red to green)
        const hue = this.fitness * 120; // 0 = red, 120 = green
        element.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
        element.style.borderRadius = '50%';
        element.style.left = `${this.genes.x}%`;
        element.style.top = `${this.genes.y}%`;
        element.style.transition = 'all 0.1s';

        // Add trail
        this.trail.forEach((pos, i) => {
            const trail = document.createElement('div');
            trail.style.position = 'absolute';
            trail.style.width = '2px';
            trail.style.height = '2px';
            trail.style.backgroundColor = `hsla(${hue}, 70%, 50%, ${0.3 - i * 0.1})`;
            trail.style.borderRadius = '50%';
            trail.style.left = `${pos.x}%`;
            trail.style.top = `${pos.y}%`;
            element.appendChild(trail);
        });

        this.element = element;
        return element;
    }

    updatePosition() {
        // Add current position to trail
        this.trail.unshift({ x: this.genes.x, y: this.genes.y });
        if (this.trail.length > 5) this.trail.pop();

        const radians = this.genes.angle * Math.PI / 180;
        this.genes.x += Math.cos(radians) * this.genes.speed * 0.1;
        this.genes.y += Math.sin(radians) * this.genes.speed * 0.1;

        // Bounce off bounds
        if (this.genes.x <= 0 || this.genes.x >= 100) {
            this.genes.angle = 180 - this.genes.angle;
        }
        if (this.genes.y <= 0 || this.genes.y >= 100) {
            this.genes.angle = 360 - this.genes.angle;
        }

        this.genes.x = Math.max(0, Math.min(100, this.genes.x));
        this.genes.y = Math.max(0, Math.min(100, this.genes.y));

        if (this.element) {
            this.element.style.left = `${this.genes.x}%`;
            this.element.style.top = `${this.genes.y}%`;
        }
    }
}

class GeneticAlgorithm {
    constructor(populationSize, mutationRate, targetCount, obstacleCount) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate / 100;
        this.population = [];
        this.generation = 0;
        this.targets = this.generateTargets(targetCount);
        this.obstacles = this.generateObstacles(obstacleCount);
        this.bestFitness = 0;
        this.avgFitness = 0;
        this.bestTargetsCollected = 0;
        this.initializePopulation();
    }

    generateTargets(count) {
        const targets = [];
        const margin = 15; // Keep targets away from edges
        for (let i = 0; i < count; i++) {
            targets.push({
                x: margin + Math.random() * (100 - 2 * margin),
                y: margin + Math.random() * (100 - 2 * margin)
            });
        }
        return targets;
    }

    generateObstacles(count) {
        const obstacles = [];
        const margin = 20; // Keep obstacles away from edges
        for (let i = 0; i < count; i++) {
            obstacles.push({
                x: margin + Math.random() * (100 - 2 * margin),
                y: margin + Math.random() * (100 - 2 * margin),
                width: 10 + Math.random() * 10,
                height: 10 + Math.random() * 10
            });
        }
        return obstacles;
    }

    initializePopulation() {
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push(new Individual());
        }
    }

    calculateFitness() {
        let totalFitness = 0;
        this.bestFitness = 0;

        for (let individual of this.population) {
            // Check collision with targets
            for (let target of this.targets) {
                const dx = target.x - individual.genes.x;
                const dy = target.y - individual.genes.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < individual.genes.size * 2) {
                    individual.collectedTargets++;
                }
            }

            // Check collision with obstacles
            for (let obstacle of this.obstacles) {
                if (individual.genes.x > obstacle.x - obstacle.width / 2 &&
                    individual.genes.x < obstacle.x + obstacle.width / 2 &&
                    individual.genes.y > obstacle.y - obstacle.height / 2 &&
                    individual.genes.y < obstacle.y + obstacle.height / 2) {
                    individual.collectedTargets = Math.max(0, individual.collectedTargets - 1);
                }
            }

            // Calculate fitness based on targets collected and survival
            individual.fitness = individual.collectedTargets + 0.1;
            totalFitness += individual.fitness;

            if (individual.fitness > this.bestFitness) {
                this.bestFitness = individual.fitness;
            }
        }

        this.avgFitness = totalFitness / this.population.length;
    }

    selection() {
        const newPopulation = [];

        for (let i = 0; i < this.populationSize; i++) {
            // Tournament selection
            const contestant1 = this.population[Math.floor(Math.random() * this.population.length)];
            const contestant2 = this.population[Math.floor(Math.random() * this.population.length)];

            newPopulation.push(
                contestant1.fitness > contestant2.fitness ? contestant1 : contestant2
            );
        }

        return newPopulation;
    }

    crossover(parent1, parent2) {
        const child = new Individual();

        // Perform crossover for each gene
        for (let gene in parent1.genes) {
            child.genes[gene] = Math.random() < 0.5 ?
                parent1.genes[gene] :
                parent2.genes[gene];
        }

        return child;
    }

    mutation(individual) {
        for (let gene in individual.genes) {
            if (Math.random() < this.mutationRate) {
                switch (gene) {
                    case 'x':
                    case 'y':
                        individual.genes[gene] = Math.random() * 100;
                        break;
                    case 'speed':
                        individual.genes[gene] = Math.random() * 5;
                        break;
                    case 'angle':
                        individual.genes[gene] = Math.random() * 360;
                        break;
                }
            }
        }
    }

    evolve() {
        this.calculateFitness();
        let newPopulation = this.selection();

        const nextGeneration = [];
        for (let i = 0; i < this.populationSize; i += 2) {
            const parent1 = newPopulation[i];
            const parent2 = newPopulation[Math.min(i + 1, this.populationSize - 1)];

            const child1 = this.crossover(parent1, parent2);
            const child2 = this.crossover(parent2, parent1);

            this.mutation(child1);
            this.mutation(child2);

            nextGeneration.push(child1);
            if (nextGeneration.length < this.populationSize) {
                nextGeneration.push(child2);
            }
        }

        this.population = nextGeneration;
        this.generation++;
    }
}

// Simulation control
let simulation = null;
let animationId = null;
let simulationArea = document.getElementById('simulation-area');

// Create targets
function createTarget(x, y) {
    const target = document.createElement('div');
    target.style.position = 'absolute';
    target.style.width = '15px';
    target.style.height = '15px';
    target.style.backgroundColor = '#dc3545';
    target.style.borderRadius = '50%';
    target.style.left = `${x}%`;
    target.style.top = `${y}%`;
    target.style.border = '2px solid #fff';
    target.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.5)';
    return target;
}

// Create obstacle
function createObstacle(x, y, width, height) {
    const obstacle = document.createElement('div');
    obstacle.style.position = 'absolute';
    obstacle.style.width = `${width}%`;
    obstacle.style.height = `${height}%`;
    obstacle.style.backgroundColor = '#343a40';
    obstacle.style.left = `${x - width / 2}%`;
    obstacle.style.top = `${y - height / 2}%`;
    obstacle.style.opacity = '0.7';
    return obstacle;
}

function updateStats() {
    document.getElementById('generation-count').textContent = simulation.generation;
    document.getElementById('best-fitness').textContent = simulation.bestFitness.toFixed(4);
    document.getElementById('avg-fitness').textContent = simulation.avgFitness.toFixed(4);
    document.getElementById('best-targets').textContent = simulation.bestTargetsCollected;
}

function animate() {
    simulation.evolve();

    // Update visuals
    simulationArea.innerHTML = '';

    // Add targets
    for (let target of simulation.targets) {
        simulationArea.appendChild(createTarget(target.x, target.y));
    }

    // Add obstacles
    for (let obstacle of simulation.obstacles) {
        simulationArea.appendChild(createObstacle(obstacle.x, obstacle.y, obstacle.width, obstacle.height));
    }

    // Add individuals
    for (let individual of simulation.population) {
        simulationArea.appendChild(individual.createVisualElement());
        individual.updatePosition();
    }

    updateStats();

    // Continue animation
    animationId = requestAnimationFrame(animate);
}

document.getElementById('start-btn').addEventListener('click', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const populationSize = parseInt(document.getElementById('population-size').value);
    const mutationRate = parseInt(document.getElementById('mutation-rate').value);
    const targetCount = parseInt(document.getElementById('target-count').value);
    const obstacleCount = parseInt(document.getElementById('obstacle-count').value);

    simulation = new GeneticAlgorithm(populationSize, mutationRate, targetCount, obstacleCount);
    animate();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    simulationArea.innerHTML = '';
    simulationArea.appendChild(target);
    document.getElementById('generation-count').textContent = '0';
    document.getElementById('best-fitness').textContent = '0';
    document.getElementById('avg-fitness').textContent = '0';
});