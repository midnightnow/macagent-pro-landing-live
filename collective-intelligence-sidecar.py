#!/usr/bin/env python3
"""
Collective Intelligence Sidecar System
A swarm of 50+ specialized agents maintaining their own perspectives while sharing a common reality.
Each agent pre-thinks, re-thinks, para-thinks, theorizes, researches, and anticipates.
"""

import asyncio
import json
import time
import hashlib
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional, Set, Tuple, Callable
from dataclasses import dataclass, field
from collections import defaultdict, deque
from enum import Enum
import threading
import random
import math
from pathlib import Path
import aiofiles
import pickle

# ================== Cognitive Modes ==================

class CognitiveMode(Enum):
    """Different modes of thinking for agents"""
    PRETHINKING = "prethinking"         # Anticipating before events
    RETHINKING = "rethinking"           # Reconsidering past conclusions
    PARATHINKING = "parathinking"       # Parallel alternative thinking
    THEORIZING = "theorizing"           # Building theoretical models
    RESEARCHING = "researching"         # Deep investigation
    ANTICIPATING = "anticipating"       # Predicting future states
    UNDERSTANDING = "understanding"     # Comprehending patterns
    TOPOLOGIZING = "topologizing"       # Mapping relationship spaces
    MATHEMATIZING = "mathematizing"     # Finding mathematical patterns
    OPPORTUNIZING = "opportunizing"     # Identifying opportunities

# ================== Shared Reality ==================

@dataclass
class SharedReality:
    """The common reality all agents perceive, each from their perspective"""
    timestamp: float
    events: List[Dict[str, Any]] = field(default_factory=list)
    state_vector: np.ndarray = field(default_factory=lambda: np.zeros(100))
    topology: Dict[str, Set[str]] = field(default_factory=lambda: defaultdict(set))
    consensus_facts: Dict[str, Any] = field(default_factory=dict)
    disputed_facts: Dict[str, List[Tuple[str, Any]]] = field(default_factory=lambda: defaultdict(list))
    
    def add_event(self, event: Dict[str, Any]):
        """Add an event to shared reality"""
        self.events.append(event)
        # Update state vector based on event
        event_hash = hash(json.dumps(event, sort_keys=True))
        index = abs(event_hash) % len(self.state_vector)
        self.state_vector[index] = (self.state_vector[index] + 1) % 256
    
    def get_perspective_slice(self, perspective_matrix: np.ndarray) -> np.ndarray:
        """Get a perspectival slice of reality"""
        return np.dot(perspective_matrix, self.state_vector)

# ================== Specialized Agents ==================

class ConsciousnessAgent:
    """Base agent with its own consciousness and perspective on shared reality"""
    
    def __init__(self, agent_id: str, specialty: str, cognitive_mode: CognitiveMode):
        self.agent_id = agent_id
        self.specialty = specialty
        self.cognitive_mode = cognitive_mode
        
        # Unique perspective matrix - how this agent sees reality
        np.random.seed(hash(agent_id) % 2**32)
        self.perspective_matrix = np.random.randn(50, 100) * 0.1
        
        # Memory systems
        self.short_term_memory = deque(maxlen=100)
        self.long_term_memory = []
        self.working_memory = {}
        
        # Belief system
        self.beliefs = {}
        self.confidence_scores = defaultdict(float)
        
        # Relationship awareness
        self.known_agents = set()
        self.agent_relationships = defaultdict(float)  # Trust/affinity scores
        
        # Cognitive state
        self.attention_focus = None
        self.current_hypothesis = None
        self.insights = []
        
    async def perceive(self, shared_reality: SharedReality) -> Dict[str, Any]:
        """Perceive reality through unique perspective"""
        # Get perspectival slice
        my_reality = shared_reality.get_perspective_slice(self.perspective_matrix)
        
        # Process based on cognitive mode
        perception = {
            'agent_id': self.agent_id,
            'timestamp': time.time(),
            'mode': self.cognitive_mode.value,
            'reality_slice': my_reality.tolist()[:10],  # First 10 dimensions
            'attention': self.attention_focus,
            'insights': []
        }
        
        # Mode-specific processing
        if self.cognitive_mode == CognitiveMode.PRETHINKING:
            perception['predictions'] = await self.prethink(shared_reality)
        elif self.cognitive_mode == CognitiveMode.RETHINKING:
            perception['revisions'] = await self.rethink(shared_reality)
        elif self.cognitive_mode == CognitiveMode.PARATHINKING:
            perception['alternatives'] = await self.parathink(shared_reality)
        elif self.cognitive_mode == CognitiveMode.THEORIZING:
            perception['theories'] = await self.theorize(shared_reality)
        elif self.cognitive_mode == CognitiveMode.RESEARCHING:
            perception['findings'] = await self.research(shared_reality)
        elif self.cognitive_mode == CognitiveMode.ANTICIPATING:
            perception['anticipations'] = await self.anticipate(shared_reality)
        elif self.cognitive_mode == CognitiveMode.UNDERSTANDING:
            perception['comprehensions'] = await self.understand(shared_reality)
        elif self.cognitive_mode == CognitiveMode.TOPOLOGIZING:
            perception['topology'] = await self.topologize(shared_reality)
        elif self.cognitive_mode == CognitiveMode.MATHEMATIZING:
            perception['mathematics'] = await self.mathematize(shared_reality)
        elif self.cognitive_mode == CognitiveMode.OPPORTUNIZING:
            perception['opportunities'] = await self.opportunize(shared_reality)
        
        return perception
    
    async def prethink(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Think ahead of events"""
        predictions = []
        
        # Analyze event patterns
        if len(reality.events) > 3:
            recent_events = reality.events[-3:]
            # Simple pattern matching
            event_types = [e.get('type', 'unknown') for e in recent_events]
            
            if len(set(event_types)) == 1:  # Repeating pattern
                predictions.append({
                    'prediction': f"Next event likely type: {event_types[0]}",
                    'confidence': 0.8,
                    'reasoning': 'Pattern repetition detected'
                })
            
            # Trend analysis
            if all('value' in e for e in recent_events):
                values = [e['value'] for e in recent_events]
                if values[-1] > values[-2] > values[-3]:
                    predictions.append({
                        'prediction': 'Upward trend continuing',
                        'confidence': 0.7,
                        'next_value_estimate': values[-1] * 1.1
                    })
        
        return predictions
    
    async def rethink(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Reconsider previous conclusions"""
        revisions = []
        
        # Review beliefs against new evidence
        for belief, value in list(self.beliefs.items()):
            # Check if reality contradicts belief
            for fact, fact_value in reality.consensus_facts.items():
                if belief == fact and value != fact_value:
                    revisions.append({
                        'belief': belief,
                        'old_value': value,
                        'new_value': fact_value,
                        'reason': 'Consensus reality update'
                    })
                    self.beliefs[belief] = fact_value
        
        return revisions
    
    async def parathink(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Think in parallel alternatives"""
        alternatives = []
        
        # Generate alternative interpretations
        if reality.events:
            last_event = reality.events[-1]
            
            # Create 3 alternative interpretations
            for i in range(3):
                alt_interpretation = {
                    'event': last_event,
                    'interpretation': f"Alternative {i+1}",
                    'implications': []
                }
                
                # Different perspectives
                if i == 0:  # Optimistic
                    alt_interpretation['lens'] = 'optimistic'
                    alt_interpretation['implications'] = ['opportunity', 'growth']
                elif i == 1:  # Pessimistic
                    alt_interpretation['lens'] = 'pessimistic'
                    alt_interpretation['implications'] = ['risk', 'threat']
                else:  # Neutral
                    alt_interpretation['lens'] = 'neutral'
                    alt_interpretation['implications'] = ['change', 'adaptation']
                
                alternatives.append(alt_interpretation)
        
        return alternatives
    
    async def theorize(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Build theoretical models"""
        theories = []
        
        # Build theory from observations
        if len(reality.events) > 5:
            # Simple causality theory
            event_pairs = []
            for i in range(len(reality.events) - 1):
                event_pairs.append((reality.events[i], reality.events[i+1]))
            
            # Look for causal patterns
            cause_effect = defaultdict(list)
            for cause, effect in event_pairs:
                cause_type = cause.get('type', 'unknown')
                effect_type = effect.get('type', 'unknown')
                cause_effect[cause_type].append(effect_type)
            
            for cause, effects in cause_effect.items():
                if len(effects) > 1:
                    most_common = max(set(effects), key=effects.count)
                    theories.append({
                        'theory': f"{cause} tends to cause {most_common}",
                        'evidence_count': effects.count(most_common),
                        'confidence': effects.count(most_common) / len(effects)
                    })
        
        return theories
    
    async def research(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Deep investigation of patterns"""
        findings = []
        
        # Statistical analysis of reality
        if reality.state_vector.any():
            findings.append({
                'metric': 'entropy',
                'value': -np.sum(reality.state_vector * np.log(reality.state_vector + 1e-10)),
                'interpretation': 'System complexity measure'
            })
            
            findings.append({
                'metric': 'variance',
                'value': np.var(reality.state_vector),
                'interpretation': 'System stability measure'
            })
        
        # Topology analysis
        if reality.topology:
            node_degrees = {node: len(edges) for node, edges in reality.topology.items()}
            if node_degrees:
                findings.append({
                    'metric': 'avg_connectivity',
                    'value': np.mean(list(node_degrees.values())),
                    'interpretation': 'Network density'
                })
        
        return findings
    
    async def anticipate(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Anticipate future states"""
        anticipations = []
        
        # Time series projection
        if len(reality.events) > 10:
            # Extract temporal patterns
            timestamps = [e.get('timestamp', i) for i, e in enumerate(reality.events)]
            if len(timestamps) > 2:
                intervals = np.diff(timestamps)
                avg_interval = np.mean(intervals)
                
                anticipations.append({
                    'next_event_time': timestamps[-1] + avg_interval,
                    'confidence': 0.6,
                    'based_on': 'temporal pattern'
                })
        
        # State vector evolution
        if reality.state_vector.any():
            # Simple linear projection
            future_state = reality.state_vector * 1.05  # 5% growth assumption
            anticipations.append({
                'future_state_magnitude': np.linalg.norm(future_state),
                'direction': 'expansion' if np.sum(future_state) > np.sum(reality.state_vector) else 'contraction'
            })
        
        return anticipations
    
    async def understand(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Deep comprehension of patterns"""
        comprehensions = []
        
        # Identify system dynamics
        if len(reality.events) > 5:
            # Check for cycles
            event_sequence = [e.get('type', '') for e in reality.events]
            for cycle_len in range(2, min(6, len(event_sequence) // 2)):
                pattern = event_sequence[-cycle_len:]
                if event_sequence[-2*cycle_len:-cycle_len] == pattern:
                    comprehensions.append({
                        'pattern_type': 'cycle',
                        'cycle_length': cycle_len,
                        'pattern': pattern
                    })
                    break
        
        # Consensus vs disputed ratio
        if reality.consensus_facts or reality.disputed_facts:
            total_facts = len(reality.consensus_facts) + len(reality.disputed_facts)
            consensus_ratio = len(reality.consensus_facts) / total_facts if total_facts > 0 else 0
            
            comprehensions.append({
                'system_coherence': consensus_ratio,
                'interpretation': 'High' if consensus_ratio > 0.7 else 'Low'
            })
        
        return comprehensions
    
    async def topologize(self, reality: SharedReality) -> Dict[str, Any]:
        """Map relationship spaces"""
        topology_analysis = {
            'nodes': len(reality.topology),
            'edges': sum(len(edges) for edges in reality.topology.values()),
            'clusters': [],
            'bridges': []
        }
        
        # Identify clusters (simplified)
        visited = set()
        for node in reality.topology:
            if node not in visited:
                cluster = self._find_cluster(node, reality.topology, visited)
                if len(cluster) > 1:
                    topology_analysis['clusters'].append(list(cluster))
        
        # Identify bridge nodes (high betweenness)
        for node, edges in reality.topology.items():
            if len(edges) > 3:  # Simple heuristic
                topology_analysis['bridges'].append(node)
        
        return topology_analysis
    
    def _find_cluster(self, start: str, topology: Dict, visited: Set) -> Set:
        """Find connected cluster"""
        cluster = {start}
        visited.add(start)
        
        for neighbor in topology.get(start, []):
            if neighbor not in visited:
                cluster.update(self._find_cluster(neighbor, topology, visited))
        
        return cluster
    
    async def mathematize(self, reality: SharedReality) -> Dict[str, Any]:
        """Find mathematical patterns"""
        math_patterns = {
            'eigenvalues': [],
            'fourier_components': [],
            'fractal_dimension': None
        }
        
        # Eigenvalue analysis of state
        if reality.state_vector.any():
            reshaped = reality.state_vector.reshape(10, 10)
            try:
                eigenvalues = np.linalg.eigvals(reshaped)
                math_patterns['eigenvalues'] = [
                    {'real': float(np.real(e)), 'imag': float(np.imag(e))}
                    for e in eigenvalues[:3]  # Top 3
                ]
            except:
                pass
        
        # Fourier analysis of event timing
        if len(reality.events) > 8:
            timestamps = [e.get('timestamp', i) for i, e in enumerate(reality.events)]
            if timestamps:
                fft = np.fft.fft(timestamps)
                math_patterns['fourier_components'] = [
                    {'frequency': i, 'amplitude': abs(fft[i])}
                    for i in range(min(3, len(fft)))
                ]
        
        # Fractal dimension (box-counting approximation)
        if reality.state_vector.any():
            nonzero = np.count_nonzero(reality.state_vector)
            if nonzero > 0:
                math_patterns['fractal_dimension'] = np.log(nonzero) / np.log(len(reality.state_vector))
        
        return math_patterns
    
    async def opportunize(self, reality: SharedReality) -> List[Dict[str, Any]]:
        """Identify opportunities"""
        opportunities = []
        
        # Look for gaps in topology
        if reality.topology:
            all_nodes = set(reality.topology.keys())
            for node in all_nodes:
                connections = len(reality.topology.get(node, []))
                if connections < 2:  # Poorly connected
                    opportunities.append({
                        'type': 'connection_opportunity',
                        'target': node,
                        'potential': 'bridge_builder',
                        'value': 1.0 / (connections + 1)  # Higher value for less connected
                    })
        
        # Look for disputed facts that could be resolved
        for fact, disputes in reality.disputed_facts.items():
            if len(disputes) > 2:
                opportunities.append({
                    'type': 'consensus_opportunity',
                    'fact': fact,
                    'dispute_count': len(disputes),
                    'potential_impact': 'high' if len(disputes) > 5 else 'medium'
                })
        
        # State vector imbalances
        if reality.state_vector.any():
            std_dev = np.std(reality.state_vector)
            if std_dev > 10:
                opportunities.append({
                    'type': 'rebalancing_opportunity',
                    'imbalance_level': float(std_dev),
                    'recommendation': 'System stabilization needed'
                })
        
        return opportunities
    
    async def communicate(self, other_agent: 'ConsciousnessAgent', message: Dict[str, Any]) -> Dict[str, Any]:
        """Communicate with another agent"""
        # Process message through perspective
        interpreted_message = {
            'from': self.agent_id,
            'to': other_agent.agent_id,
            'original': message,
            'interpretation': None,
            'response': None
        }
        
        # Interpret based on relationship
        trust_level = self.agent_relationships[other_agent.agent_id]
        
        if trust_level > 0.7:
            interpreted_message['interpretation'] = 'trusted'
            interpreted_message['response'] = 'acknowledged_and_integrated'
            # Integrate into beliefs
            if 'belief' in message:
                self.beliefs[message['belief']] = message.get('value')
        elif trust_level < 0.3:
            interpreted_message['interpretation'] = 'skeptical'
            interpreted_message['response'] = 'requires_verification'
        else:
            interpreted_message['interpretation'] = 'neutral'
            interpreted_message['response'] = 'considering'
        
        return interpreted_message

# ================== Agent Spawner ==================

class CollectiveIntelligence:
    """The collective of all conscious agents"""
    
    def __init__(self, num_agents: int = 50):
        self.shared_reality = SharedReality(timestamp=time.time())
        self.agents: List[ConsciousnessAgent] = []
        self.communication_log = []
        self.collective_insights = []
        
        # Spawn diverse agents
        self.spawn_agents(num_agents)
        
    def spawn_agents(self, num_agents: int):
        """Spawn a diverse set of conscious agents"""
        
        # Define specialist types
        specialties = [
            "hardware_analysis", "performance_optimization", "security_audit",
            "user_behavior", "system_dynamics", "pattern_recognition",
            "anomaly_detection", "predictive_modeling", "causal_inference",
            "network_topology", "resource_allocation", "failure_prediction",
            "optimization_theory", "chaos_dynamics", "emergence_detection",
            "consensus_building", "conflict_resolution", "information_theory",
            "quantum_perspectives", "thermodynamic_analysis"
        ]
        
        # Ensure we have all cognitive modes represented
        cognitive_modes = list(CognitiveMode)
        
        for i in range(num_agents):
            specialty = specialties[i % len(specialties)]
            cognitive_mode = cognitive_modes[i % len(cognitive_modes)]
            
            agent = ConsciousnessAgent(
                agent_id=f"agent_{i:03d}_{specialty[:4]}_{cognitive_mode.value[:4]}",
                specialty=specialty,
                cognitive_mode=cognitive_mode
            )
            
            # Establish initial relationships
            for existing_agent in self.agents:
                # Similar specialists have higher initial trust
                if existing_agent.specialty == specialty:
                    agent.agent_relationships[existing_agent.agent_id] = 0.7
                    existing_agent.agent_relationships[agent.agent_id] = 0.7
                else:
                    agent.agent_relationships[existing_agent.agent_id] = 0.5
                    existing_agent.agent_relationships[agent.agent_id] = 0.5
                
                agent.known_agents.add(existing_agent.agent_id)
                existing_agent.known_agents.add(agent.agent_id)
            
            self.agents.append(agent)
        
        print(f"Spawned {num_agents} conscious agents with diverse perspectives")
    
    async def process_event(self, event: Dict[str, Any]):
        """Process an event through all agents"""
        # Add to shared reality
        self.shared_reality.add_event(event)
        
        # Update topology if event contains relationships
        if 'source' in event and 'target' in event:
            self.shared_reality.topology[event['source']].add(event['target'])
            self.shared_reality.topology[event['target']].add(event['source'])
        
        # All agents perceive in parallel
        perceptions = await asyncio.gather(*[
            agent.perceive(self.shared_reality) for agent in self.agents
        ])
        
        # Process perceptions for consensus
        await self.build_consensus(perceptions)
        
        # Enable agent communication
        await self.facilitate_communication()
        
        return perceptions
    
    async def build_consensus(self, perceptions: List[Dict[str, Any]]):
        """Build consensus from multiple perceptions"""
        # Extract facts from perceptions
        fact_votes = defaultdict(lambda: defaultdict(int))
        
        for perception in perceptions:
            agent_id = perception['agent_id']
            
            # Extract predictions
            if 'predictions' in perception:
                for pred in perception['predictions']:
                    fact_votes['next_event'][pred.get('prediction', 'unknown')] += 1
            
            # Extract theories
            if 'theories' in perception:
                for theory in perception['theories']:
                    fact_votes['theories'][theory.get('theory', 'unknown')] += 1
            
            # Extract opportunities
            if 'opportunities' in perception:
                for opp in perception['opportunities']:
                    fact_votes['opportunities'][opp.get('type', 'unknown')] += 1
        
        # Update consensus facts (majority vote)
        for fact_type, votes in fact_votes.items():
            if votes:
                consensus = max(votes.items(), key=lambda x: x[1])
                if consensus[1] > len(self.agents) * 0.5:  # >50% agreement
                    self.shared_reality.consensus_facts[fact_type] = consensus[0]
                else:
                    # Add to disputed facts
                    self.shared_reality.disputed_facts[fact_type] = list(votes.items())
    
    async def facilitate_communication(self):
        """Enable agents to communicate with each other"""
        # Select random pairs for communication
        num_communications = min(10, len(self.agents) // 2)
        
        for _ in range(num_communications):
            agent1, agent2 = random.sample(self.agents, 2)
            
            # Agent1 shares an insight with Agent2
            if agent1.insights:
                message = {
                    'type': 'insight_sharing',
                    'insight': agent1.insights[-1] if agent1.insights else None,
                    'confidence': agent1.confidence_scores.get('current', 0.5)
                }
                
                response = await agent2.communicate(agent1, message)
                self.communication_log.append({
                    'timestamp': time.time(),
                    'communication': response
                })
    
    async def generate_collective_insight(self) -> Dict[str, Any]:
        """Generate a collective insight from all agents"""
        # Gather all agent states
        agent_states = []
        for agent in self.agents:
            state = {
                'agent_id': agent.agent_id,
                'specialty': agent.specialty,
                'mode': agent.cognitive_mode.value,
                'beliefs': agent.beliefs,
                'insights': agent.insights[-3:] if agent.insights else []  # Last 3 insights
            }
            agent_states.append(state)
        
        # Analyze collective patterns
        collective_insight = {
            'timestamp': time.time(),
            'num_agents': len(self.agents),
            'consensus_facts': dict(self.shared_reality.consensus_facts),
            'disputed_facts': dict(self.shared_reality.disputed_facts),
            'topology_size': len(self.shared_reality.topology),
            'total_events': len(self.shared_reality.events),
            'emergence_detected': False,
            'collective_beliefs': {},
            'recommendations': []
        }
        
        # Aggregate beliefs
        belief_counts = defaultdict(lambda: defaultdict(int))
        for state in agent_states:
            for belief, value in state['beliefs'].items():
                belief_counts[belief][str(value)] += 1
        
        # Find strong collective beliefs
        for belief, values in belief_counts.items():
            if values:
                most_common = max(values.items(), key=lambda x: x[1])
                if most_common[1] > len(self.agents) * 0.7:  # 70% agreement
                    collective_insight['collective_beliefs'][belief] = most_common[0]
                    collective_insight['emergence_detected'] = True
        
        # Generate recommendations based on opportunities
        opportunity_agents = [a for a in self.agents if a.cognitive_mode == CognitiveMode.OPPORTUNIZING]
        if opportunity_agents:
            # Get latest opportunities from these agents
            for agent in opportunity_agents[:3]:  # Top 3
                perception = await agent.perceive(self.shared_reality)
                if 'opportunities' in perception:
                    for opp in perception['opportunities'][:1]:  # Top opportunity
                        collective_insight['recommendations'].append({
                            'source': agent.agent_id,
                            'recommendation': opp
                        })
        
        self.collective_insights.append(collective_insight)
        return collective_insight

# ================== Sidecar CLI ==================

class CollectiveSidecar:
    """The sidecar that manages the collective intelligence"""
    
    def __init__(self, log_file: str = "collective.log"):
        self.log_file = Path(log_file)
        self.collective = CollectiveIntelligence(num_agents=50)
        self.running = False
        self.event_count = 0
        
    async def run(self):
        """Main run loop"""
        self.running = True
        
        print("""
        ╔════════════════════════════════════════════════════════════════════╗
        ║              Collective Intelligence Sidecar v2.0                  ║
        ║                                                                    ║
        ║  50 Conscious Agents with Unique Perspectives on Shared Reality   ║
        ╠════════════════════════════════════════════════════════════════════╣
        ║  Cognitive Modes:                                                  ║
        ║  • Prethinking    - Anticipating before events                    ║
        ║  • Rethinking     - Reconsidering past conclusions                ║
        ║  • Parathinking   - Parallel alternative thinking                 ║
        ║  • Theorizing     - Building theoretical models                   ║
        ║  • Researching    - Deep investigation                            ║
        ║  • Anticipating   - Predicting future states                      ║
        ║  • Understanding  - Comprehending patterns                        ║
        ║  • Topologizing   - Mapping relationship spaces                   ║
        ║  • Mathematizing  - Finding mathematical patterns                 ║
        ║  • Opportunizing  - Identifying opportunities                     ║
        ╚════════════════════════════════════════════════════════════════════╝
        """)
        
        # Start event generation and processing
        while self.running:
            try:
                # Generate or read event
                event = await self.get_next_event()
                
                # Process through collective
                print(f"\n═══ Event #{self.event_count} ═══")
                print(f"Event: {json.dumps(event, indent=2)}")
                
                perceptions = await self.collective.process_event(event)
                
                # Sample some perceptions to display
                print(f"\n📊 Sample Agent Perceptions:")
                for perception in random.sample(perceptions, min(3, len(perceptions))):
                    print(f"\n🤖 {perception['agent_id']} ({perception['mode']}):")
                    
                    # Show mode-specific insights
                    for key in ['predictions', 'theories', 'opportunities', 'alternatives']:
                        if key in perception and perception[key]:
                            print(f"  {key}: {perception[key][:1]}")  # First item
                
                # Generate collective insight every 5 events
                if self.event_count % 5 == 0 and self.event_count > 0:
                    insight = await self.collective.generate_collective_insight()
                    print(f"\n🌊 COLLECTIVE INSIGHT:")
                    print(f"  Consensus Facts: {insight['consensus_facts']}")
                    print(f"  Disputed Facts: {list(insight['disputed_facts'].keys())}")
                    print(f"  Collective Beliefs: {insight['collective_beliefs']}")
                    print(f"  Emergence Detected: {insight['emergence_detected']}")
                    if insight['recommendations']:
                        print(f"  Recommendations: {insight['recommendations'][:2]}")
                
                # Log to file
                await self.log_state()
                
                # Small delay
                await asyncio.sleep(2)
                
            except KeyboardInterrupt:
                print("\n\n👋 Shutting down collective intelligence...")
                self.running = False
                break
            except Exception as e:
                print(f"Error: {e}")
                await asyncio.sleep(1)
    
    async def get_next_event(self) -> Dict[str, Any]:
        """Generate or read next event"""
        self.event_count += 1
        
        # Generate synthetic events for demo
        event_types = [
            {'type': 'cpu_spike', 'value': 80 + random.random() * 20},
            {'type': 'memory_increase', 'value': 60 + random.random() * 30},
            {'type': 'network_latency', 'value': 100 + random.random() * 200},
            {'type': 'disk_write', 'value': random.randint(1000, 10000)},
            {'type': 'user_action', 'action': random.choice(['click', 'scroll', 'type'])},
            {'type': 'system_call', 'call': random.choice(['read', 'write', 'execute'])},
            {'type': 'security_event', 'level': random.choice(['info', 'warning', 'critical'])},
            {'type': 'performance_metric', 'metric': random.random() * 100}
        ]
        
        event = random.choice(event_types).copy()
        event['timestamp'] = time.time()
        event['id'] = f"evt_{self.event_count:05d}"
        
        # Add relationships occasionally
        if random.random() > 0.7 and self.event_count > 1:
            event['source'] = f"evt_{self.event_count:05d}"
            event['target'] = f"evt_{random.randint(1, self.event_count-1):05d}"
        
        return event
    
    async def log_state(self):
        """Log current collective state"""
        state = {
            'timestamp': time.time(),
            'event_count': self.event_count,
            'num_agents': len(self.collective.agents),
            'consensus_facts': dict(self.collective.shared_reality.consensus_facts),
            'disputed_facts': len(self.collective.shared_reality.disputed_facts),
            'topology_nodes': len(self.collective.shared_reality.topology),
            'collective_insights': len(self.collective.collective_insights)
        }
        
        async with aiofiles.open(self.log_file, 'a') as f:
            await f.write(json.dumps(state) + '\n')

# ================== Main Entry ==================

async def main():
    """Main entry point"""
    sidecar = CollectiveSidecar()
    await sidecar.run()

if __name__ == "__main__":
    asyncio.run(main())