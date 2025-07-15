import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

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

export const OfficePulse: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 300);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Create office floor
    const floorGeometry = new THREE.PlaneGeometry(8, 8);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x111111,
      transparent: true,
      opacity: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Department colors
    const departmentColors = {
      engineering: 0x00ffff,
      marketing: 0xff6b35,
      sales: 0x90ee90,
      hr: 0xffd700
    };

    // Create employee avatars
    const employeeObjects: THREE.Object3D[] = [];
    mockEmployees.forEach((employee, index) => {
      const group = new THREE.Group();
      
      // Avatar (cylinder)
      const avatarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8);
      const avatarMaterial = new THREE.MeshLambertMaterial({ 
        color: departmentColors[employee.department],
        transparent: true,
        opacity: 0.8
      });
      const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
      avatar.position.y = 0.2;
      avatar.castShadow = true;
      group.add(avatar);

      // Activity heatmap (glowing ring)
      const ringGeometry = new THREE.RingGeometry(0.3, 0.5, 16);
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

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Animate employee avatars
      employeeObjects.forEach((obj, index) => {
        const employee = mockEmployees[index];
        obj.rotation.y = time * 0.5;
        
        // Pulse effect based on activity
        const pulse = 1 + Math.sin(time * 3 + index) * 0.1 * employee.activity;
        obj.scale.setScalar(pulse);
      });

      camera.position.x = Math.sin(time * 0.2) * 6;
      camera.position.z = Math.cos(time * 0.2) * 6;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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

    renderer.domElement.addEventListener('click', onMouseClick);

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.dispose();
    };
  }, []);

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
          className="w-full h-[300px] rounded-lg overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-700/50"
        />
        
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