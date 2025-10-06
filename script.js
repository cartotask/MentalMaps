// JavaScript for mobile navigation, animations, and interactive map

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    // Toggle mobile navigation
    menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Smooth scroll to section
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Highlight current section in navigation
    const sections = document.querySelectorAll('section');
    
    function highlightNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNav);
    
    // Animate info boxes when they enter the viewport
    const infoBoxes = document.querySelectorAll('.info-box');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    infoBoxes.forEach(box => {
        observer.observe(box);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ==================== LEAFLET MAP FUNCTIONALITY ====================
    
    // Initialize the map (centered on Europe for general spatial cognition context)
    const map = L.map('map').setView([48.8566, 2.3522], 3); // Centered on Europe
    
    // Add different tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });
    
    const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Satellite'
    });
    
    const topographicLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap'
    });
    
    // Add default layer
    osmLayer.addTo(map);
    
    // Add layer control
    const baseMaps = {
        "Street Map": osmLayer,
        "Satellite": satelliteLayer,
        "Topographic": topographicLayer
    };
    
    L.control.layers(baseMaps).addTo(map);
    
    // Add some example markers for important spatial cognition locations
    const exampleLocations = [
        {
            coords: [59.3293, 18.0686],
            title: "Stockholm University",
            description: "Where the Mosers discovered grid cells"
        },
        {
            coords: [51.5246, -0.1340],
            title: "University College London",
            description: "Where John O'Keefe discovered place cells"
        },
        {
            coords: [47.4217, 13.6556],
            title: "Ramsau am Dachstein",
            description: "Alpine environment for navigation studies"
        },
        {
            coords: [42.3601, -71.0942],
            title: "MIT",
            description: "Cognitive science and AI research"
        }
    ];
    
    exampleLocations.forEach(location => {
        L.marker(location.coords)
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50;">${location.title}</h3>
                    <p style="margin: 0; color: #666;">${location.description}</p>
                </div>
            `);
    });
    
    // Drawing functionality
    let drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    let drawControl;
    let currentMode = 'point';
    
    // Initialize draw control
    function initDrawControl() {
        drawControl = new L.Control.Draw({
            draw: {
                polygon: false,
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);
    }
    
    initDrawControl();
    
    // Map drawing event handlers
    map.on(L.Draw.Event.CREATED, function (e) {
        const type = e.layerType;
        const layer = e.layer;
        
        // Add style based on type
        if (type === 'marker') {
            layer.setIcon(L.divIcon({
                className: 'custom-marker',
                html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c; font-size: 24px;"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 24]
            }));
        } else if (type === 'polyline') {
            layer.setStyle({
                color: '#3498db',
                weight: 4,
                opacity: 0.7
            });
        } else if (type === 'polygon') {
            layer.setStyle({
                color: '#2ecc71',
                weight: 2,
                fillColor: '#2ecc71',
                fillOpacity: 0.2
            });
        }
        
        drawnItems.addLayer(layer);
        updateMarkerList();
        
        // Add popup with coordinates
        const coords = getLayerCoordinates(layer, type);
        layer.bindPopup(`
            <div>
                <strong>${type.toUpperCase()}</strong><br>
                Coordinates: ${coords}<br>
                <button onclick="removeLayer(${layer._leaflet_id})" style="margin-top: 0.5rem; padding: 0.3rem 0.6rem; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>
            </div>
        `);
    });
    
    // Helper function to get coordinates from layer
    function getLayerCoordinates(layer, type) {
        if (type === 'marker') {
            const latlng = layer.getLatLng();
            return `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        } else if (type === 'polyline') {
            const latlngs = layer.getLatLngs();
            return `${latlngs[0].lat.toFixed(4)}, ${latlngs[0].lng.toFixed(4)} to ${latlngs[latlngs.length-1].lat.toFixed(4)}, ${latlngs[latlngs.length-1].lng.toFixed(4)}`;
        } else if (type === 'polygon') {
            const latlngs = layer.getLatLngs()[0];
            return `${latlngs.length} points area`;
        }
        return 'Unknown';
    }
    
    // Update marker list display
    function updateMarkerList() {
        const markerList = document.getElementById('markerList');
        markerList.innerHTML = '';
        
        drawnItems.eachLayer(function(layer) {
            const type = layer instanceof L.Marker ? 'point' : 
                        layer instanceof L.Polyline ? 'line' : 'polygon';
            
            const coords = getLayerCoordinates(layer, type);
            
            const markerItem = document.createElement('div');
            markerItem.className = 'marker-item';
            markerItem.innerHTML = `
                <span class="type">${type.toUpperCase()}</span>
                <span class="coords">${coords}</span>
                <button class="delete" onclick="removeLayer(${layer._leaflet_id})">Delete</button>
            `;
            
            markerList.appendChild(markerItem);
        });
        
        if (markerList.children.length === 0) {
            markerList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No markers yet. Start drawing on the map!</p>';
        }
    }
    
    // Remove layer function (needs to be global for popup buttons)
    window.removeLayer = function(layerId) {
        drawnItems.eachLayer(function(layer) {
            if (layer._leaflet_id === layerId) {
                drawnItems.removeLayer(layer);
                updateMarkerList();
            }
        });
    };
    
    // Drawing mode buttons
    const drawPointBtn = document.getElementById('drawPoint');
    const drawLineBtn = document.getElementById('drawLine');
    const drawPolygonBtn = document.getElementById('drawPolygon');
    const clearAllBtn = document.getElementById('clearAll');
    
    let currentDrawControl = null;
    
    function setDrawMode(mode) {
        // Remove existing draw control
        if (currentDrawControl) {
            map.removeControl(currentDrawControl);
        }
        
        // Update button states
        [drawPointBtn, drawLineBtn, drawPolygonBtn].forEach(btn => btn.classList.remove('active'));
        
        // Create new draw control for specific mode
        const drawOptions = {
            draw: {
                polygon: mode === 'polygon',
                polyline: mode === 'line',
                rectangle: false,
                circle: false,
                marker: mode === 'point',
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems
            }
        };
        
        currentDrawControl = new L.Control.Draw(drawOptions);
        map.addControl(currentDrawControl);
        
        // Activate current button
        if (mode === 'point') drawPointBtn.classList.add('active');
        if (mode === 'line') drawLineBtn.classList.add('active');
        if (mode === 'polygon') drawPolygonBtn.classList.add('active');
        
        currentMode = mode;
    }
    
    // Button event listeners
    drawPointBtn