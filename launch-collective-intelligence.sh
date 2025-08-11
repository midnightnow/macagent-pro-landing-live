#!/bin/bash

# Launch the Collective Intelligence Sidecar System
# 50+ conscious agents maintaining perspectives on shared reality

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║           MacAgent Pro Collective Intelligence System                ║"
echo "║                                                                      ║"
echo "║  'Like 50 friends with their own awareness of shared reality'       ║"
echo "║   All spawned from a single CLI session                             ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Choose Intelligence Mode:"
echo ""
echo "1) Ocean Mode - Parallel fields of intelligence with emergence"
echo "2) Collective Mode - 50 conscious agents with unique perspectives"
echo "3) Hybrid Mode - Both systems running in parallel"
echo "4) Demo Mode - Interactive dashboard with synthetic data"
echo ""
read -p "Select mode (1-4): " mode

case $mode in
    1)
        echo ""
        echo "🌊 Launching Intelligence Ocean..."
        echo "Creating fields of intelligence through parallel processing..."
        echo ""
        python3 macagent-sidecar-intelligence.py --demo &
        OCEAN_PID=$!
        
        echo "Ocean launched (PID: $OCEAN_PID)"
        echo ""
        echo "View dashboard at: file://$(pwd)/intelligence-ocean-dashboard.html?demo=true"
        echo ""
        echo "Press Ctrl+C to stop"
        wait $OCEAN_PID
        ;;
        
    2)
        echo ""
        echo "🧠 Launching Collective Intelligence..."
        echo "Spawning 50 conscious agents with diverse cognitive modes..."
        echo ""
        echo "Cognitive Modes Active:"
        echo "  • Prethinking    - Anticipating before events"
        echo "  • Rethinking     - Reconsidering past conclusions"
        echo "  • Parathinking   - Parallel alternative thinking"
        echo "  • Theorizing     - Building theoretical models"
        echo "  • Researching    - Deep investigation"
        echo "  • Anticipating   - Predicting future states"
        echo "  • Understanding  - Comprehending patterns"
        echo "  • Topologizing   - Mapping relationship spaces"
        echo "  • Mathematizing  - Finding mathematical patterns"
        echo "  • Opportunizing  - Identifying opportunities"
        echo ""
        python3 collective-intelligence-sidecar.py
        ;;
        
    3)
        echo ""
        echo "🌊🧠 Launching Hybrid Intelligence System..."
        echo "Both Ocean and Collective systems running in parallel..."
        echo ""
        
        # Launch Ocean in background
        python3 macagent-sidecar-intelligence.py --demo &
        OCEAN_PID=$!
        
        # Launch Collective in background
        python3 collective-intelligence-sidecar.py &
        COLLECTIVE_PID=$!
        
        echo "Ocean launched (PID: $OCEAN_PID)"
        echo "Collective launched (PID: $COLLECTIVE_PID)"
        echo ""
        echo "Dashboard: file://$(pwd)/intelligence-ocean-dashboard.html?demo=true"
        echo ""
        echo "Press Ctrl+C to stop both systems"
        
        # Trap Ctrl+C to kill both processes
        trap "kill $OCEAN_PID $COLLECTIVE_PID 2>/dev/null" INT
        
        # Wait for both
        wait $OCEAN_PID $COLLECTIVE_PID
        ;;
        
    4)
        echo ""
        echo "🎮 Launching Interactive Demo Mode..."
        echo ""
        echo "Opening Intelligence Ocean Dashboard..."
        
        # Check which open command to use
        if command -v xdg-open &> /dev/null; then
            xdg-open "file://$(pwd)/intelligence-ocean-dashboard.html?demo=true"
        elif command -v open &> /dev/null; then
            open "file://$(pwd)/intelligence-ocean-dashboard.html?demo=true"
        else
            echo "Please open in browser: file://$(pwd)/intelligence-ocean-dashboard.html?demo=true"
        fi
        
        echo ""
        echo "Dashboard opened in browser"
        echo "The dashboard runs entirely in the browser with synthetic data"
        echo ""
        echo "Features:"
        echo "  • Real-time packet generation"
        echo "  • Intelligence field visualization"
        echo "  • Emergence pattern detection"
        echo "  • Packet graph visualization"
        echo "  • Ocean metrics tracking"
        echo ""
        echo "No server needed - runs entirely client-side!"
        ;;
        
    *)
        echo "Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "Collective Intelligence System Terminated"
echo "═══════════════════════════════════════════════════════════════════════"