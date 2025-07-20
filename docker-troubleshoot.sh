#!/bin/bash

echo "🐳 Docker Troubleshooting Script"
echo "================================"
echo ""

# Function to check Docker daemon
check_docker_daemon() {
    echo "1. Checking Docker daemon status..."
    if docker info > /dev/null 2>&1; then
        echo "   ✅ Docker daemon is running"
    else
        echo "   ❌ Docker daemon is not running"
        echo "   💡 Start Docker Desktop or run: sudo systemctl start docker"
        exit 1
    fi
}

# Function to check network connectivity
check_network() {
    echo "2. Checking network connectivity..."
    if curl -s --max-time 5 https://registry-1.docker.io > /dev/null; then
        echo "   ✅ Docker registry is accessible"
    else
        echo "   ❌ Cannot reach Docker registry"
        echo "   💡 Check your internet connection or proxy settings"
        return 1
    fi
}

# Function to clear Docker cache
clear_docker_cache() {
    echo "3. Clearing Docker cache..."
    echo "   🧹 Removing unused containers, networks, images..."
    docker system prune -f
    echo "   ✅ Docker cache cleared"
}

# Function to pull images individually
pull_images() {
    echo "4. Pulling Docker images individually..."
    
    echo "   📦 Pulling node:20-alpine..."
    if docker pull node:20-alpine; then
        echo "   ✅ node:20-alpine pulled successfully"
    else
        echo "   ❌ Failed to pull node:20-alpine"
        echo "   💡 Try using a different image tag: node:18-alpine"
        return 1
    fi
    
    echo "   📦 Pulling nginx:alpine..."
    if docker pull nginx:alpine; then
        echo "   ✅ nginx:alpine pulled successfully"
    else
        echo "   ❌ Failed to pull nginx:alpine"
        return 1
    fi
    
    echo "   📦 Pulling postgres:15-alpine..."
    if docker pull postgres:15-alpine; then
        echo "   ✅ postgres:15-alpine pulled successfully"
    else
        echo "   ❌ Failed to pull postgres:15-alpine"
        return 1
    fi
}

# Function to build with increased timeout
build_with_timeout() {
    echo "5. Building with increased timeout..."
    export DOCKER_BUILDKIT=1
    export COMPOSE_HTTP_TIMEOUT=300
    export DOCKER_CLIENT_TIMEOUT=300
    
    echo "   🏗️  Building containers..."
    docker-compose build --no-cache
}

# Function to show alternative solutions
show_alternatives() {
    echo ""
    echo "🔧 Alternative Solutions:"
    echo "========================"
    echo ""
    echo "If you're still having issues, try:"
    echo ""
    echo "1. Use different base images:"
    echo "   - Replace 'node:20-alpine' with 'node:18-alpine'"
    echo "   - Replace 'postgres:15-alpine' with 'postgres:14-alpine'"
    echo ""
    echo "2. Configure Docker for proxy (if behind corporate firewall):"
    echo "   - Add proxy settings to ~/.docker/config.json"
    echo ""
    echo "3. Run without Docker (development mode):"
    echo "   - Frontend: npm run dev"
    echo "   - Backend: cd backend && npm run dev"
    echo ""
    echo "4. Use Docker Desktop settings:"
    echo "   - Increase memory/CPU allocation"
    echo "   - Enable experimental features"
    echo ""
    echo "5. Use local environment variables:"
    echo "   - Create .env files as shown in env-setup-guide.md"
}

# Main execution
main() {
    check_docker_daemon
    
    if check_network; then
        echo ""
        echo "🚀 Network looks good! Trying to build..."
        clear_docker_cache
        
        if pull_images; then
            build_with_timeout
            echo ""
            echo "🎉 Build completed successfully!"
            echo "Run: docker-compose up -d"
        else
            echo ""
            echo "❌ Failed to pull some images"
            show_alternatives
        fi
    else
        echo ""
        echo "❌ Network issues detected"
        show_alternatives
    fi
}

# Run main function
main 