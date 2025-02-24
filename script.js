// Wait until the DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
    // Get references to the player (circle) and the game area
    const circle = document.getElementById("circle");
    const gameArea = document.body;

    // Constants for gameplay mechanics
    const enemySpawnInterval = 1000; // Enemies spawn 
    const enemySpeed = 2; // Speed of enemies moving towards the player
    const bulletSpeed = 10; // Speed of bullets fired by the player
    const bulletInterval = 1000; // Interval between bullets being fired
    const maxBulletRange = 500; // Maximum bullet travel distance
    const maxTargetRange = 500; // Maximum range for detecting enemies

    // Function to create an enemy
    function createEnemy() {
        const enemy = document.createElement("div");
        enemy.classList.add("enemy"); // Add enemy class for styling

        // Get a random spawn position at the edges of the screen
        const { x, y } = getRandomSpawnPosition();
        enemy.style.left = `${x}px`;
        enemy.style.top = `${y}px`;

        // Add the enemy to the game area
        gameArea.appendChild(enemy);
        
        // Move the enemy toward the player
        moveEnemy(enemy);
    }

    // Function to get a random spawn position at the edges of the screen
    function getRandomSpawnPosition() {
        const edge = Math.floor(Math.random() * 4); // Choose a random edge (0-3)
        
        // Determine spawn position based on the selected edge
        const x = edge === 1 ? window.innerWidth + 50  // Right side
                 : edge === 3 ? -50  // Left side
                 : Math.random() * window.innerWidth; // Random within width
        
        const y = edge === 0 ? -50  // Top side
                 : edge === 2 ? window.innerHeight + 50  // Bottom side
                 : Math.random() * window.innerHeight; // Random within height
        
        return { x, y };
    }

    // Function to move an enemy towards the player
    function moveEnemy(enemy) {
        function update() {
            // Get player (circle) position
            const { circleX, circleY, circleRadius } = getCirclePosition();
            // Get enemy position
            const { enemyX, enemyY, enemySize } = getEnemyPosition(enemy);

            // Calculate distance between player and enemy
            const dx = circleX - enemyX, dy = circleY - enemyY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if the enemy has collided with the player
            if (distance < circleRadius + enemySize) {
                enemy.classList.add("dying"); // Add a visual effect for dying
                setTimeout(() => enemy.remove(), 500); // Remove the enemy after 500ms
                return;
            }

            // Move enemy towards player
            enemy.style.left = `${enemy.offsetLeft + (dx / distance) * enemySpeed}px`;
            enemy.style.top = `${enemy.offsetTop + (dy / distance) * enemySpeed}px`;

            requestAnimationFrame(update); // Keep updating movement
        }
        update();
    }

    // Function to get the player's position and size
    function getCirclePosition() {
        const circleX = circle.offsetLeft + circle.offsetWidth / 2;
        const circleY = circle.offsetTop + circle.offsetHeight / 2;
        const circleRadius = circle.offsetWidth / 2;
        return { circleX, circleY, circleRadius };
    }

    // Function to get an enemy's position and size
    function getEnemyPosition(enemy) {
        const enemyX = enemy.offsetLeft + enemy.offsetWidth / 2;
        const enemyY = enemy.offsetTop + enemy.offsetHeight / 2;
        const enemySize = enemy.offsetWidth / 2;
        return { enemyX, enemyY, enemySize };
    }

    // Function to create a bullet
    function createBullet() {
        const { circleX, circleY } = getCirclePosition();
        const closestEnemy = getClosestEnemy(circleX, circleY);
    
        // Only shoot if there's an enemy within range
        if (!closestEnemy) return;
    
        const { enemyX, enemyY } = getEnemyPosition(closestEnemy);
        const dx = enemyX - circleX, dy = enemyY - circleY;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        // If enemy is too far, don't shoot
        if (distance > maxTargetRange) return;
    
        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.style.left = `${circleX}px`;
        bullet.style.top = `${circleY}px`;
    
        
        bullet.dataset.dx = (dx / distance) * bulletSpeed;
        bullet.dataset.dy = (dy / distance) * bulletSpeed;
    
        gameArea.appendChild(bullet);
        moveBullet(bullet);
    
        // Remove bullet after 1 second to prevent infinite bullets
        setTimeout(() => bullet.remove(), 1000);
    }
    

    // Function to find the closest enemy to the player
    function getClosestEnemy(x, y) {
        const enemies = document.querySelectorAll(".enemy");
        let closestEnemy = null, minDistance = Infinity;
    
        enemies.forEach(enemy => {
            const { enemyX, enemyY } = getEnemyPosition(enemy);
            const dx = enemyX - x, dy = enemyY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            if (distance < minDistance && distance < maxTargetRange) { // Check if within range
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
    
        return closestEnemy;
    }

    // Function to move bullets
    function moveBullet(bullet) {
        let traveledDistance = 0; // Track how far the bullet has moved
    
        function update() {
            createBulletTrail(bullet);
    
            const dx = parseFloat(bullet.dataset.dx);
            const dy = parseFloat(bullet.dataset.dy);
    
            bullet.style.left = `${bullet.offsetLeft + dx}px`;
            bullet.style.top = `${bullet.offsetTop + dy}px`;
    
            traveledDistance += Math.sqrt(dx * dx + dy * dy);
    
            // Remove bullet if it exceeds the max range
            if (traveledDistance >= maxBulletRange) {
                bullet.remove();
                return;
            }
    
            // Bullet collision check with enemies
            document.querySelectorAll(".enemy").forEach(enemy => {
                const { enemyX, enemyY, enemySize } = getEnemyPosition(enemy);
                const { bulletX, bulletY } = getBulletPosition(bullet);
                const distance = Math.sqrt((enemyX - bulletX) ** 2 + (enemyY - bulletY) ** 2);
    
                if (distance < enemySize) {
                    enemy.classList.add("dying");
                    createImpactEffect(enemyX, enemyY);
                    setTimeout(() => enemy.remove(), 500);
                    bullet.remove();
                }
            });
    
            if (bullet.parentElement) requestAnimationFrame(update);
        }
        update();
    }
    
    // Create a fading trail effect behind the bullet
    function createBulletTrail(bullet) {
        const trail = document.createElement("div");
        trail.classList.add("bullet-trail");
        trail.style.left = `${bullet.offsetLeft}px`;
        trail.style.top = `${bullet.offsetTop}px`;
        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 300);
    }

    // Function to get bullet position
    function getBulletPosition(bullet) {
        return { bulletX: bullet.offsetLeft, bulletY: bullet.offsetTop };
    }

    function createImpactEffect(x, y) {
        const impact = document.createElement("div");
        impact.classList.add("impact-effect");
        impact.style.left = `${x}px`;
        impact.style.top = `${y}px`;
        document.body.appendChild(impact);
        setTimeout(() => impact.remove(), 500);
    }

    // Set intervals to spawn enemies and fire bullets periodically
    setInterval(createEnemy, enemySpawnInterval);
    setInterval(createBullet, bulletInterval);
});
