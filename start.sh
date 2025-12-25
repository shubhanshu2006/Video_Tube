#!/bin/bash

# VideoTube - Quick Start Script

echo "========================================"
echo "   VideoTube - Quick Start Script"
echo "========================================"
echo ""

show_menu() {
    echo "What would you like to do?"
    echo ""
    echo "1. Install Frontend Dependencies"
    echo "2. Install Backend Dependencies"
    echo "3. Start Backend Server"
    echo "4. Start Frontend Server"
    echo "5. Start Both (Backend + Frontend)"
    echo "6. Build Frontend for Production"
    echo "7. Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1) install_frontend ;;
        2) install_backend ;;
        3) start_backend ;;
        4) start_frontend ;;
        5) start_both ;;
        6) build_frontend ;;
        7) exit 0 ;;
        *) echo "Invalid choice, please try again." && show_menu ;;
    esac
}

install_frontend() {
    echo ""
    echo "Installing Frontend Dependencies..."
    cd Frontend
    npm install
    cd ..
    echo ""
    echo "Frontend dependencies installed successfully!"
    echo ""
    read -p "Press enter to continue..."
    show_menu
}

install_backend() {
    echo ""
    echo "Installing Backend Dependencies..."
    cd Backend
    npm install
    cd ..
    echo ""
    echo "Backend dependencies installed successfully!"
    echo ""
    read -p "Press enter to continue..."
    show_menu
}

start_backend() {
    echo ""
    echo "Starting Backend Server..."
    echo "Backend will run on http://localhost:8000"
    echo ""
    cd Backend
    npm run dev
    cd ..
}

start_frontend() {
    echo ""
    echo "Starting Frontend Server..."
    echo "Frontend will run on http://localhost:5173"
    echo ""
    cd Frontend
    npm run dev
    cd ..
}

start_both() {
    echo ""
    echo "Starting Both Backend and Frontend..."
    echo ""
    
    # Start backend in background
    cd Backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    sleep 3
    
    # Start frontend in background
    cd Frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo "Both servers are running!"
    echo "Backend: http://localhost:8000 (PID: $BACKEND_PID)"
    echo "Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
}

build_frontend() {
    echo ""
    echo "Building Frontend for Production..."
    cd Frontend
    npm run build
    echo ""
    echo "Build complete! Check the 'dist' folder."
    cd ..
    echo ""
    read -p "Press enter to continue..."
    show_menu
}

# Start the menu
show_menu
