import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Employee {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  department: 'engineering' | 'marketing' | 'sales' | 'hr';
  mood: '😊' | '😴' | '🤔' | '🔥' | '😎' | '🤝';
  activity: number;
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Alex Chen', position: { x: 2, y: 0, z: 1 }, department: 'engineering', mood: '😊', activity: 0.8 },
  { id: '2', name: 'Sarah Johnson', position: { x: -1, y: 0, z: 2 }, department: 'marketing', mood: '🔥', activity: 0.9 },
  { id: '3', name: 'Mike Davis', position: { x: 1, y: 0, z: -1 }, department: 'sales', mood: '😎', activity: 0.7 },
  { id: '4', name: 'Emma Wilson', position: { x: -2, y: 0, z: 0 }, department: 'hr', mood: '🤝', activity: 0.6 },
  { id: '5', name: 'David Kim', position: { x: 0, y: 0, z: 2 }, department: 'engineering', mood: '🤔', activity: 0.5 },
  { id: '6', name: 'Lisa Garcia', position: { x: 1, y: 0, z: 1 }, department: 'marketing', mood: '😴', activity: 0.3 },
];

const moodList: Employee['mood'][] = ['😊', '😴', '🤔', '🔥', '😎', '🤝'];

function randomMood() {
  return moodList[Math.floor(Math.random() * moodList.length)];
}

export const OfficePulse: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees.map((e, i) => ({
    ...e,
    // Spread out avatars in a wider circle with random jitter
    position: {
      x: Math.cos((i / mockEmployees.length) * Math.PI * 2) * 3.5 + (Math.random() - 0.5) * 0.7,
      y: 0,
      z: Math.sin((i / mockEmployees.length) * Math.PI * 2) * 3.5 + (Math.random() - 0.5) * 0.7
    }
  })));
  const [avatarScreenPositions, setAvatarScreenPositions] = useState<{id: string, x: number, y: number, mood: Employee['mood'], name: string}[]>([]);
  const [autoRotate, setAutoRotate] = useState(true);

  // Real-time mock updates for activity and mood
  useEffect(() => {
    const interval = setInterval(() => {
      setEmployees(prev => prev.map((emp, i) => ({
        ...emp,
        activity: Math.max(0.2, Math.min(1, emp.activity + (Math.random() - 0.5) * 0.3)),
        mood: randomMood(),
        // Animate floating up/down
        position: {
          ...emp.position,
          y: Math.sin(Date.now() * 0.001 + i) * 0.15
        }
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create renderer first
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(600, 360);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Now create camera
    const camera = new THREE.PerspectiveCamera(75, 1.33, 0.1, 1000);
    camera.position.set(0, 5, 7);
    camera.lookAt(0, 0, 0);

    // Add OrbitControls for interactive rotation/pan/zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 4;
    controls.maxDistance = 16;
    controls.target.set(0, 0, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 8, 16);
    sceneRef.current = scene;

    // Subtle grid on the floor
    const gridHelper = new THREE.GridHelper(8, 16, 0x444466, 0x222233);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Create office floor
    const floorGeometry = new THREE.PlaneGeometry(8, 8);
    const floorMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x111122,
      transparent: true,
      opacity: 0.85,
      roughness: 0.7,
      metalness: 0.2,
      clearcoat: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add ambient and point lights
    const ambientLight = new THREE.AmbientLight(0x8888ff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.7, 20);
    pointLight.position.set(0, 6, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);
    const spotLight = new THREE.SpotLight(0x00ffff, 0.3, 20, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 8, 0);
    scene.add(spotLight);

    // Department colors
    const departmentColors = {
      engineering: 0x00ffff,
      marketing: 0xff6b35,
      sales: 0x90ee90,
      hr: 0xffd700
    };

    // Create employee avatars
    let employeeObjects: THREE.Object3D[] = [];
    function createAvatars() {
      // Remove previous
      employeeObjects.forEach(obj => scene.remove(obj));
      employeeObjects = [];
      employees.forEach((employee, index) => {
      const group = new THREE.Group();
        // Avatar (sphere)
        const avatarGeometry = new THREE.SphereGeometry(0.22, 24, 24);
        const avatarMaterial = new THREE.MeshPhysicalMaterial({ 
        color: departmentColors[employee.department],
        transparent: true,
          opacity: 0.92,
          roughness: 0.3,
          metalness: 0.7,
          clearcoat: 0.5
      });
      const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
        avatar.position.y = 0.22;
      avatar.castShadow = true;
      group.add(avatar);
        // Glowing aura
        const auraGeometry = new THREE.SphereGeometry(0.28, 24, 24);
        const auraMaterial = new THREE.MeshBasicMaterial({ 
          color: departmentColors[employee.department],
          transparent: true,
          opacity: 0.18
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.position.y = 0.22;
        group.add(aura);
      // Activity heatmap (glowing ring)
        const ringGeometry = new THREE.RingGeometry(0.3, 0.5, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: departmentColors[employee.department],
        transparent: true,
        opacity: employee.activity * 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      group.add(ring);
      group.position.set(employee.position.x, employee.position.y, employee.position.z);
      group.userData = { employee, index };
      scene.add(group);
      employeeObjects.push(group);
    });
    }
    createAvatars();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      // Animate employee avatars
      employeeObjects.forEach((obj, index) => {
        const employee = employees[index];
        obj.rotation.y = time * 0.5;
        // Pulse effect based on activity
        const pulse = 1 + Math.sin(time * 3 + index) * 0.1 * employee.activity;
        obj.scale.setScalar(pulse);
        // Animate floating up/down
        obj.position.y = employees[index].position.y + Math.sin(time * 1.2 + index) * 0.08;
      });
      if (autoRotate) {
        camera.position.x = Math.sin(time * 0.2) * 6;
        camera.position.z = Math.cos(time * 0.2) * 6;
        camera.lookAt(0, 0, 0);
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
      // Calculate screen positions for floating overlays
      const positions = employees.map((emp, i) => {
        const obj = employeeObjects[i];
        if (!obj) return { id: emp.id, x: 0, y: 0, mood: emp.mood, name: emp.name };
        const vector = new THREE.Vector3(emp.position.x, 0.7, emp.position.z);
        vector.project(camera);
        const x = ((vector.x + 1) / 2) * renderer.domElement.width;
        const y = ((-vector.y + 1) / 2) * renderer.domElement.height;
        return { id: emp.id, x, y, mood: emp.mood, name: emp.name };
      });
      setAvatarScreenPositions(positions);
    };
    animate();

    // Mouse interaction (hover and click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(employeeObjects, true);
      if (intersects.length > 0) {
        const hoveredObject = intersects[0].object.parent;
        if (hoveredObject && hoveredObject.userData.employee) {
          setHoveredEmployee(hoveredObject.userData.employee.id);
        }
      } else {
        setHoveredEmployee(null);
      }
    };
    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(employeeObjects, true);
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object.parent;
        if (selectedObject && selectedObject.userData.employee) {
          setSelectedEmployee(selectedObject.userData.employee);
        }
      }
    };
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.dispose();
      controls.dispose();
    };
  }, [employees]);

  const getDepartmentColor = (department: string) => {
    const colors = {
      engineering: 'text-cyan-400',
      marketing: 'text-orange-400',
      sales: 'text-green-400',
      hr: 'text-yellow-400'
    };
    return colors[department as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAutoRotate((v) => !v)}
        className="absolute right-4 top-4 z-30 px-3 py-1 rounded-lg bg-black/60 text-xs text-cyan-300 border border-cyan-700 hover:bg-cyan-900/40 transition"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        {autoRotate ? 'Disable Auto-Rotate' : 'Enable Auto-Rotate'}
      </button>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Office Pulse</h3>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span className="text-gray-400">Engineering</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-gray-400">Marketing</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Sales</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">HR</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div 
          ref={mountRef}
          className="w-full max-w-[600px] h-[360px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/60 to-black/80 backdrop-blur-lg border border-cyan-900/40 mx-auto"
        />
        {/* Floating profile card above hovered/selected avatar */}
        {avatarScreenPositions.map(pos => {
          const isSelected = selectedEmployee && pos.id === selectedEmployee.id;
          const isHovered = hoveredEmployee === pos.id;
          if (isSelected || isHovered) {
            const emp = employees.find(e => e.id === pos.id);
            if (!emp) return null;
            return (
              <div
                key={pos.id}
                style={{
                  position: 'absolute',
                  left: pos.x - 60,
                  top: pos.y - 80,
                  width: 120,
                  pointerEvents: 'none',
                  textAlign: 'center',
                  fontWeight: 500,
                  color: 'white',
                  textShadow: '0 2px 8px #000, 0 0 2px #000',
                  fontSize: 14,
                  zIndex: 20,
                  background: 'rgba(30,30,60,0.72)',
                  borderRadius: 16,
                  padding: '10px 8px 8px 8px',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.13)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 2 }}>{emp.mood}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 1 }}>{emp.name}</div>
                <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 500, marginBottom: 4 }}>
                  {emp.department.charAt(0).toUpperCase() + emp.department.slice(1)}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 1 }}>Activity</div>
                <div style={{ width: '100%', height: 6, background: '#222', borderRadius: 3, marginBottom: 1 }}>
                  <div style={{ width: `${Math.round(emp.activity * 100)}%`, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)' }} />
                </div>
                <div style={{ fontSize: 10, color: '#ccc' }}>{Math.round(emp.activity * 100)}%</div>
              </div>
            );
          }
          return null;
        })}
        
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 min-w-[200px]"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{selectedEmployee.mood}</span>
              <div>
                <p className="text-white font-medium">{selectedEmployee.name}</p>
                <p className={`text-xs ${getDepartmentColor(selectedEmployee.department)}`}>
                  {selectedEmployee.department.charAt(0).toUpperCase() + selectedEmployee.department.slice(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedEmployee.activity * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{Math.round(selectedEmployee.activity * 100)}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Activity Level</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* Add bounce animation for mood emoji */
const style = document.createElement('style');
style.innerHTML = `@keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }`;
document.head.appendChild(style);