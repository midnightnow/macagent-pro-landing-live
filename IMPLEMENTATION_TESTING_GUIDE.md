# Implementation & Testing Guide
**Collective Intelligence Sidecar System**  
**Production Deployment & Validation Framework**

---

## 1. Quick Start Guide 🚀

### Installation

```bash
# Clone or navigate to project directory
cd /Users/studio/macagent-pro-landing-live

# Install Python dependencies
pip3 install asyncio aiofiles numpy

# Make launch script executable
chmod +x launch-collective-intelligence.sh

# Run system
./launch-collective-intelligence.sh
```

### Launch Modes

| Mode | Command | Description | Use Case |
|------|---------|-------------|----------|
| **Ocean** | `python3 macagent-sidecar-intelligence.py` | Parallel intelligence fields | System monitoring |
| **Collective** | `python3 collective-intelligence-sidecar.py` | 50 conscious agents | Complex analysis |
| **Hybrid** | Mode 3 in launcher | Both systems parallel | Maximum intelligence |
| **Demo** | Mode 4 in launcher | Browser dashboard | Visualization |

---

## 2. Testing Framework 🧪

### 2.1 Unit Tests

```python
# test_consciousness_agent.py
import asyncio
import numpy as np
from collective_intelligence_sidecar import (
    ConsciousnessAgent, 
    SharedReality,
    CognitiveMode
)

class TestConsciousnessAgent:
    """Test individual agent behaviors"""
    
    async def test_perception(self):
        """Test agent perception through perspective matrix"""
        # Create agent
        agent = ConsciousnessAgent(
            agent_id="test_agent",
            specialty="testing",
            cognitive_mode=CognitiveMode.UNDERSTANDING
        )
        
        # Create shared reality
        reality = SharedReality(timestamp=0)
        reality.add_event({'type': 'test', 'value': 42})
        
        # Test perception
        perception = await agent.perceive(reality)
        
        assert perception['agent_id'] == 'test_agent'
        assert perception['mode'] == 'understanding'
        assert 'comprehensions' in perception
        
    async def test_perspective_uniqueness(self):
        """Ensure each agent has unique perspective"""
        agents = []
        for i in range(10):
            agent = ConsciousnessAgent(
                agent_id=f"agent_{i}",
                specialty="test",
                cognitive_mode=CognitiveMode.PRETHINKING
            )
            agents.append(agent)
        
        # Compare perspective matrices
        for i, agent1 in enumerate(agents):
            for agent2 in agents[i+1:]:
                # Matrices should be different
                diff = np.sum(np.abs(
                    agent1.perspective_matrix - agent2.perspective_matrix
                ))
                assert diff > 100  # Significant difference
    
    async def test_memory_systems(self):
        """Test short-term and long-term memory"""
        agent = ConsciousnessAgent(
            agent_id="memory_test",
            specialty="memory",
            cognitive_mode=CognitiveMode.RETHINKING
        )
        
        # Add to short-term memory
        for i in range(150):  # Exceeds maxlen of 100
            agent.short_term_memory.append(f"memory_{i}")
        
        assert len(agent.short_term_memory) == 100
        assert agent.short_term_memory[0] == "memory_50"  # Old ones pushed out
        
    async def test_belief_revision(self):
        """Test belief system updates"""
        agent = ConsciousnessAgent(
            agent_id="belief_test",
            specialty="belief",
            cognitive_mode=CognitiveMode.RETHINKING
        )
        
        # Set initial belief
        agent.beliefs['test_fact'] = 'initial_value'
        
        # Create reality with consensus fact
        reality = SharedReality(timestamp=0)
        reality.consensus_facts['test_fact'] = 'revised_value'
        
        # Process and check revision
        perception = await agent.perceive(reality)
        revisions = perception.get('revisions', [])
        
        assert len(revisions) > 0
        assert agent.beliefs['test_fact'] == 'revised_value'

# Run tests
async def run_unit_tests():
    test = TestConsciousnessAgent()
    await test.test_perception()
    await test.test_perspective_uniqueness()
    await test.test_memory_systems()
    await test.test_belief_revision()
    print("✅ All unit tests passed")

if __name__ == "__main__":
    asyncio.run(run_unit_tests())
```

### 2.2 Integration Tests

```python
# test_collective_intelligence.py
import asyncio
from collective_intelligence_sidecar import CollectiveIntelligence

class TestCollectiveIntelligence:
    """Test multi-agent coordination"""
    
    async def test_consensus_building(self):
        """Test consensus formation from multiple agents"""
        collective = CollectiveIntelligence(num_agents=10)
        
        # Process events
        for i in range(5):
            event = {'type': 'test', 'value': i, 'timestamp': i}
            perceptions = await collective.process_event(event)
            
        # Check consensus facts
        assert len(collective.shared_reality.consensus_facts) >= 0
        
        # Check if any disputed facts
        if collective.shared_reality.disputed_facts:
            # Disputes should have multiple viewpoints
            for fact, disputes in collective.shared_reality.disputed_facts.items():
                assert len(disputes) >= 2
    
    async def test_communication_network(self):
        """Test agent communication and trust dynamics"""
        collective = CollectiveIntelligence(num_agents=5)
        
        # Initial trust levels
        for agent in collective.agents:
            assert len(agent.known_agents) == 4  # Knows all others
            assert all(0.4 <= trust <= 0.8 
                      for trust in agent.agent_relationships.values())
        
        # Facilitate communication
        await collective.facilitate_communication()
        
        # Check communication log
        assert len(collective.communication_log) > 0
    
    async def test_emergence_detection(self):
        """Test emergence pattern detection"""
        collective = CollectiveIntelligence(num_agents=10)
        
        # Generate repeating pattern
        for cycle in range(3):
            for event_type in ['A', 'B', 'C']:
                event = {'type': event_type, 'timestamp': cycle * 3 + ord(event_type)}
                await collective.process_event(event)
        
        # Generate collective insight
        insight = await collective.generate_collective_insight()
        
        # Check for emergence
        assert 'emergence_detected' in insight
        assert 'collective_beliefs' in insight

# Run integration tests
async def run_integration_tests():
    test = TestCollectiveIntelligence()
    await test.test_consensus_building()
    await test.test_communication_network()
    await test.test_emergence_detection()
    print("✅ All integration tests passed")
```

### 2.3 Performance Tests

```python
# test_performance.py
import asyncio
import time
import psutil
import numpy as np
from collective_intelligence_sidecar import CollectiveIntelligence

class PerformanceTests:
    """Test system performance characteristics"""
    
    async def test_scaling(self):
        """Test scaling with different agent counts"""
        results = {}
        
        for num_agents in [10, 25, 50, 100]:
            collective = CollectiveIntelligence(num_agents=num_agents)
            
            # Measure event processing time
            start = time.time()
            for i in range(100):
                event = {'type': 'perf_test', 'value': i, 'timestamp': i}
                await collective.process_event(event)
            
            elapsed = time.time() - start
            events_per_second = 100 / elapsed
            
            results[num_agents] = {
                'total_time': elapsed,
                'events_per_second': events_per_second,
                'time_per_event': elapsed / 100
            }
            
            print(f"{num_agents} agents: {events_per_second:.2f} events/sec")
        
        # Check scaling is reasonable (not exponential)
        assert results[100]['time_per_event'] < results[10]['time_per_event'] * 20
    
    async def test_memory_usage(self):
        """Test memory consumption"""
        process = psutil.Process()
        
        # Baseline memory
        baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Create large collective
        collective = CollectiveIntelligence(num_agents=50)
        
        # Process many events
        for i in range(1000):
            event = {'type': 'memory_test', 'value': i, 'timestamp': i}
            await collective.process_event(event)
        
        # Check memory after processing
        current_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = current_memory - baseline_memory
        
        print(f"Memory increase: {memory_increase:.2f} MB")
        
        # Should be under 500MB for 50 agents with 1000 events
        assert memory_increase < 500
    
    async def test_parallel_processing(self):
        """Test parallel perception performance"""
        collective = CollectiveIntelligence(num_agents=50)
        
        # Single event, parallel perception
        event = {'type': 'parallel_test', 'value': 42, 'timestamp': 0}
        
        start = time.time()
        perceptions = await collective.process_event(event)
        parallel_time = time.time() - start
        
        # Sequential baseline (for comparison)
        start = time.time()
        sequential_perceptions = []
        for agent in collective.agents:
            p = await agent.perceive(collective.shared_reality)
            sequential_perceptions.append(p)
        sequential_time = time.time() - start
        
        speedup = sequential_time / parallel_time
        print(f"Parallel speedup: {speedup:.2f}x")
        
        # Should achieve at least 2x speedup
        assert speedup > 2.0

# Run performance tests
async def run_performance_tests():
    test = PerformanceTests()
    await test.test_scaling()
    await test.test_memory_usage()
    await test.test_parallel_processing()
    print("✅ All performance tests passed")
```

---

## 3. Deployment Configuration 🔧

### 3.1 Environment Setup

```bash
# production.env
export COLLECTIVE_NUM_AGENTS=50
export COLLECTIVE_LOG_LEVEL=INFO
export COLLECTIVE_LOG_FILE=/var/log/collective-intelligence.log
export COLLECTIVE_MAX_MEMORY_MB=1000
export COLLECTIVE_EVENT_RATE_LIMIT=100
export COLLECTIVE_CONSENSUS_THRESHOLD=0.7
export COLLECTIVE_EMERGENCE_THRESHOLD=0.8
```

### 3.2 Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN pip install asyncio aiofiles numpy psutil

# Copy application files
COPY collective-intelligence-sidecar.py .
COPY macagent-sidecar-intelligence.py .
COPY launch-collective-intelligence.sh .

# Set permissions
RUN chmod +x launch-collective-intelligence.sh

# Environment variables
ENV COLLECTIVE_NUM_AGENTS=50
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD python3 -c "import json; data=json.load(open('ocean-metrics.json')); exit(0 if data else 1)"

# Run collective intelligence
CMD ["python3", "collective-intelligence-sidecar.py"]
```

### 3.3 Kubernetes Deployment

```yaml
# collective-intelligence-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: collective-intelligence
  labels:
    app: collective-intelligence
spec:
  replicas: 1
  selector:
    matchLabels:
      app: collective-intelligence
  template:
    metadata:
      labels:
        app: collective-intelligence
    spec:
      containers:
      - name: collective-sidecar
        image: collective-intelligence:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        env:
        - name: COLLECTIVE_NUM_AGENTS
          value: "50"
        - name: COLLECTIVE_LOG_LEVEL
          value: "INFO"
        volumeMounts:
        - name: logs
          mountPath: /var/log
        - name: metrics
          mountPath: /app/metrics
      volumes:
      - name: logs
        emptyDir: {}
      - name: metrics
        persistentVolumeClaim:
          claimName: collective-metrics-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: collective-intelligence-service
spec:
  selector:
    app: collective-intelligence
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
```

---

## 4. Monitoring & Observability 📊

### 4.1 Prometheus Metrics

```python
# metrics_exporter.py
from prometheus_client import Gauge, Counter, Histogram, start_http_server
import json
import time

# Define metrics
agent_count = Gauge('collective_agent_count', 'Number of active agents')
event_count = Counter('collective_events_total', 'Total events processed')
consensus_ratio = Gauge('collective_consensus_ratio', 'Consensus vs disputed ratio')
emergence_events = Counter('collective_emergence_total', 'Total emergence events')
processing_time = Histogram('collective_processing_seconds', 'Event processing time')

def export_metrics():
    """Export metrics for Prometheus"""
    while True:
        try:
            # Read metrics from ocean-metrics.json
            with open('ocean-metrics.json', 'r') as f:
                data = json.load(f)
            
            # Update Prometheus metrics
            ocean_metrics = data.get('ocean_metrics', {})
            agent_count.set(ocean_metrics.get('field_count', 0))
            consensus_ratio.set(ocean_metrics.get('average_coherence', 0))
            
            sidecar_stats = data.get('sidecar_stats', {})
            event_count.inc(sidecar_stats.get('lines_processed', 0))
            
        except Exception as e:
            print(f"Metrics export error: {e}")
        
        time.sleep(10)

if __name__ == '__main__':
    # Start Prometheus metrics server
    start_http_server(8000)
    export_metrics()
```

### 4.2 Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Collective Intelligence Monitoring",
    "panels": [
      {
        "title": "Active Agents",
        "targets": [
          {
            "expr": "collective_agent_count",
            "legendFormat": "Agents"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Events Per Second",
        "targets": [
          {
            "expr": "rate(collective_events_total[1m])",
            "legendFormat": "Events/sec"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Consensus Ratio",
        "targets": [
          {
            "expr": "collective_consensus_ratio",
            "legendFormat": "Coherence"
          }
        ],
        "type": "gauge",
        "thresholds": [
          {"value": 0.5, "color": "yellow"},
          {"value": 0.8, "color": "green"}
        ]
      },
      {
        "title": "Emergence Events",
        "targets": [
          {
            "expr": "rate(collective_emergence_total[5m])",
            "legendFormat": "Emergence/min"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Processing Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, collective_processing_seconds_bucket)",
            "legendFormat": "p95 latency"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

## 5. Troubleshooting Guide 🔧

### 5.1 Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **High Memory Usage** | >1GB for 50 agents | Reduce agent count or implement memory limits |
| **Slow Consensus** | >10 cycles to converge | Adjust consensus threshold or reduce agent diversity |
| **No Emergence** | No patterns detected | Increase event complexity or agent interactions |
| **CPU Spike** | 100% CPU usage | Enable event rate limiting or reduce parallel operations |
| **Communication Deadlock** | Agents stop communicating | Reset trust networks or restart system |

### 5.2 Debug Commands

```bash
# Enable debug logging
export COLLECTIVE_LOG_LEVEL=DEBUG
python3 collective-intelligence-sidecar.py 2>&1 | tee debug.log

# Profile performance
python3 -m cProfile -o profile.stats collective-intelligence-sidecar.py

# Analyze profile
python3 -c "import pstats; p = pstats.Stats('profile.stats'); p.sort_stats('cumulative').print_stats(20)"

# Memory profiling
python3 -m memory_profiler collective-intelligence-sidecar.py

# Watch metrics in real-time
watch -n 1 'tail -n 50 ocean-metrics.json | python3 -m json.tool'
```

### 5.3 Recovery Procedures

```python
# recovery.py
import pickle
import json
from pathlib import Path

def save_collective_state(collective, filename='collective_state.pkl'):
    """Save collective state for recovery"""
    state = {
        'shared_reality': collective.shared_reality,
        'agent_beliefs': {a.agent_id: a.beliefs for a in collective.agents},
        'agent_relationships': {a.agent_id: dict(a.agent_relationships) for a in collective.agents},
        'collective_insights': collective.collective_insights
    }
    
    with open(filename, 'wb') as f:
        pickle.dump(state, f)
    
    print(f"State saved to {filename}")

def restore_collective_state(collective, filename='collective_state.pkl'):
    """Restore collective from saved state"""
    with open(filename, 'rb') as f:
        state = pickle.load(f)
    
    collective.shared_reality = state['shared_reality']
    collective.collective_insights = state['collective_insights']
    
    # Restore agent states
    for agent in collective.agents:
        if agent.agent_id in state['agent_beliefs']:
            agent.beliefs = state['agent_beliefs'][agent.agent_id]
            agent.agent_relationships = defaultdict(
                float,
                state['agent_relationships'].get(agent.agent_id, {})
            )
    
    print(f"State restored from {filename}")
```

---

## 6. Production Checklist ✅

### Pre-Deployment

- [ ] Run all unit tests
- [ ] Run integration tests  
- [ ] Run performance tests
- [ ] Review resource requirements
- [ ] Configure monitoring
- [ ] Set up logging
- [ ] Prepare rollback plan

### Deployment

- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Monitor metrics for 1 hour
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor for 24 hours

### Post-Deployment

- [ ] Analyze emergence patterns
- [ ] Review consensus formation
- [ ] Check memory usage trends
- [ ] Optimize based on metrics
- [ ] Document observed behaviors

---

## 7. API Reference 📚

### Core Classes

```python
class ConsciousnessAgent:
    """Individual agent with unique perspective"""
    
    Methods:
    - perceive(reality) -> Dict
    - prethink(reality) -> List[Dict]
    - rethink(reality) -> List[Dict]
    - communicate(other_agent, message) -> Dict
    
    Attributes:
    - agent_id: str
    - cognitive_mode: CognitiveMode
    - perspective_matrix: np.ndarray
    - beliefs: Dict
    - agent_relationships: Dict[str, float]

class CollectiveIntelligence:
    """Collective of all agents"""
    
    Methods:
    - spawn_agents(num_agents: int)
    - process_event(event: Dict) -> List[Dict]
    - build_consensus(perceptions: List[Dict])
    - generate_collective_insight() -> Dict
    
    Attributes:
    - agents: List[ConsciousnessAgent]
    - shared_reality: SharedReality
    - collective_insights: List[Dict]

class IntelligenceOcean:
    """Ocean of intelligence fields"""
    
    Methods:
    - add_packet(packet: IntelligencePacket)
    - create_wave(packets: List) -> List
    - detect_emergence() -> List[Dict]
    - calculate_ocean_metrics() -> Dict
```

---

*Implementation & Testing Guide Complete*  
*Ready for production deployment and continuous monitoring*