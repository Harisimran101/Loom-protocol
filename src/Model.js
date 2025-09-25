import { useGLTF, CameraControls, Html } from "@react-three/drei"
import { useEffect, useRef, useState, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from 'three'
import gsap from "gsap"

// Fixed lighting positions - no longer controllable via Leva
function FixedLighting() {
    const pointLightRef = useRef()

  return (
    <>
      {/* Point Light - Fixed position */}
      <pointLight 
        position={[3, -5, 13]}
        intensity={2}
        distance={250}
        ref={pointLightRef}
        decay={2}
        color="#ffaa44"
        castShadow
        shadow-mapSize={1024}
        shadow-bias={-0.0001}
      />
        {/* Point Light Helper */}
      {/* {pointLightRef.current && (
        <primitive 
          object={new THREE.PointLightHelper(pointLightRef.current, 1, "#ffaa44")} 
        />
      )} */}
      
      {/* Spotlight - Fixed position */}
      <spotLight 
        position={[0, 8, -6]}
        intensity={0.5}
        angle={Math.PI / 6}
        penumbra={1.1}
        distance={400}
        color="#ffaa44"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0001}
      />
    </>
  )
}

export function Model({ envIntensity = 0.0 }) {
  const { scene } = useThree()
  const { nodes, materials } = useGLTF('model3.glb')
  const [dynamicIntensity, setDynamicIntensity] = useState(envIntensity)
  const screenRef = useRef()
  const cameraRef = useRef()
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  
  const isMobile = window.innerWidth < 768

  // Optimized material update function
  const updateMaterialsEnvIntensity = useCallback((intensity) => {
    Object.values(materials).forEach(material => {
      if (material.envMapIntensity !== undefined) {
        material.envMapIntensity = intensity
        material.needsUpdate = true
      }
    })
    scene.environmentIntensity = 0
  }, [materials, scene])

  // Setup camera controls
  const setupCameraControls = useCallback(() => {
    if (!cameraRef.current) return
    
    // cameraRef.current.disconnect()
    // cameraRef.current.azimuthRotateSpeed = 0.001
    // cameraRef.current.polarRotateSpeed = 0.0
    // cameraRef.current.dollySpeed = 0.0
    // cameraRef.current.truckSpeed = 0.0
    cameraRef.current.smoothTime = 0.75
  }, [])

  // Hide/show viewspots
  const toggleViewspots = useCallback((hide = true) => {
    const viewspot1 = document.querySelector('#viewspot1')
    const viewspot2 = document.querySelector('#viewspot2')
    
    if (viewspot1 && viewspot2) {
      const action = hide ? 'add' : 'remove'
      viewspot1.classList[action]('hide-viewspot')
      viewspot2.classList[action]('hide-viewspot')
    }
  }, [])

  // Camera position handlers
  const setCameraPosition = useCallback((position, target, delay = 0) => {
    setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.smoothTime = 0.75
        cameraRef.current.setLookAt(...position, ...target, true)
      }
    }, delay)
  }, [])

  // Main animation sequence
  const playAnimation = useCallback(() => {
    const logo = scene.getObjectByName('logo')
    if (!logo) return

    // Hide screen initially
   

    // Hide viewspots initially
    toggleViewspots(true)

    // Set initial logo position
    logo.position.set(0, logo.position.y - 0.75, 31)

    // Animate logo appearance
    gsap.to(logo.material, {
      emissiveIntensity: 1.5,
      opacity: 1,
      duration: 2.5,
      delay: 1.5,
      ease: "sine.inOut",
      onComplete: () => {
        const exploreBtn = document.querySelector('.explore-btn')
        if (exploreBtn) {
          exploreBtn.style.bottom = '20px'
          setIsAnimationComplete(true)
        }
      }
    })
  }, [scene, toggleViewspots])

  // Explore button handler
  const handleExploreClick = useCallback(() => {
    const logo = scene.getObjectByName('logo')
    const exploreBtn = document.querySelector('.explore-btn')

    document.querySelector('#audio').play()
    
    if (!logo) return

    // Animate fog
    gsap.to(scene.fog, {
      near: 500,
      far: 1000,
      duration: 1,
      ease: "sine.inOut",
      onProgress: () => {
        // Set camera to overview position
        const overviewPos = isMobile ? [35, 0.7, 320] : [0, 0.5, 200]
        const overviewTarget = isMobile ? [-62, 0, 0] : [0, 0, 0]
        setCameraPosition(overviewPos, overviewTarget, 1700)

        // Show screen
        setTimeout(() => {
          if (screenRef.current) {
            screenRef.current.style.opacity = '1'
          }
        }, 1700)

        // Show viewspots
        setTimeout(() => toggleViewspots(false), 2900)
      }
    })

    // Animate logo out
    gsap.to(logo.position, {
      z: -11,
      x: -3,
      y: 0.7,
      duration: 2.5,
      delay: 0.5,
      ease: "sine.inOut",
      onProgress: () => {
        if (exploreBtn) {
          exploreBtn.style.bottom = '-200px'
        }
      }
    })
  }, [scene, isMobile, setCameraPosition, toggleViewspots])

  // Viewspot handlers
  const handleViewspot1Click = useCallback(() => {
    const backBtn = document.querySelector('.back-btn')
    if (backBtn) backBtn.style.bottom = '20px'

    setTimeout(() => toggleViewspots(true), 500)

    const pos = isMobile ? [-32, -24, -55.9] : [-32, -24, -88.9]
    const target = isMobile ? [-32.3, -24, -57.5] : [-32.3, -24, -90.5]
    setCameraPosition(pos, target)
  }, [isMobile, toggleViewspots, setCameraPosition])

  const handleViewspot2Click = useCallback(() => {
    toggleViewspots(true)
    
    setTimeout(() => {
      const backBtn = document.querySelector('.back-btn')
      if (backBtn) backBtn.style.bottom = '20px'
    }, 500)

    const pos = isMobile ? [140.1, 15, -110] : [35.1, 15, -140]
    const target = isMobile ? [-100, 30.2, -110] : [-35, 15.2, -140]
    setCameraPosition(pos, target)
  }, [isMobile, toggleViewspots, setCameraPosition])

  const handleBackClick = useCallback(() => {
    setTimeout(() => toggleViewspots(false), 500)
    
    const backBtn = document.querySelector('.back-btn')
    if (backBtn) backBtn.style.bottom = '-120px'

    const overviewPos = isMobile ? [35, 0.7, 320] : [0, 0.5, 200]
    const overviewTarget = isMobile ? [-62, 0, 0] : [0, 0, 0]
    setCameraPosition(overviewPos, overviewTarget)
  }, [isMobile, toggleViewspots, setCameraPosition])

  // Setup event listeners
  useEffect(() => {
    setupCameraControls()
    playAnimation()

    // Setup explore button
    const exploreBtn = document.querySelector('.explore-btn')
    if (exploreBtn) {
      exploreBtn.addEventListener('click', handleExploreClick)
    }

    return () => {
      if (exploreBtn) {
        exploreBtn.removeEventListener('click', handleExploreClick)
      }
    }
  }, [setupCameraControls, playAnimation, handleExploreClick])

  // Setup viewspot event listeners
  useEffect(() => {
    if (!isAnimationComplete) return

    const viewspot1 = document.querySelector('#viewspot1')
    const viewspot2 = document.querySelector('#viewspot2')
    const backBtn = document.querySelector('.back-btn')

    if (viewspot1) viewspot1.addEventListener('click', handleViewspot1Click)
    if (viewspot2) viewspot2.addEventListener('click', handleViewspot2Click)
    if (backBtn) backBtn.addEventListener('click', handleBackClick)

    return () => {
      if (viewspot1) viewspot1.removeEventListener('click', handleViewspot1Click)
      if (viewspot2) viewspot2.removeEventListener('click', handleViewspot2Click)
      if (backBtn) backBtn.removeEventListener('click', handleBackClick)
    }
  }, [isAnimationComplete, handleViewspot1Click, handleViewspot2Click, handleBackClick])

  // Update materials on prop change
  useEffect(() => {
    updateMaterialsEnvIntensity(envIntensity)
  }, [updateMaterialsEnvIntensity, envIntensity])

  // Update materials on dynamic intensity change
  useEffect(() => {
    updateMaterialsEnvIntensity(dynamicIntensity)
  }, [updateMaterialsEnvIntensity, dynamicIntensity])

  // Animation frame loop
  useFrame(() => {
    const globe = scene.getObjectByName('globe-object')
    if (globe) {
      globe.rotation.y += 0.025
    }
  })

  return (
    <>
      <CameraControls ref={cameraRef} />
      
      <group position={[0, 12, 20]}>

              <FixedLighting />

        {/* Viewspot 1 */}
        <Html scale={14} position={[-3.6, -12.5, -25]}>
          <div className="viewspot hide-viewspot" id="viewspot1">
            <i className="bi bi-eye"></i>
          </div>
        </Html>

        {/* Viewspot 2 */}
        <Html scale={14} position={[-130.1, 1.2, -40]}>
          <div className="viewspot hide-viewspot" id="viewspot2">
            <i className="bi bi-eye"></i>
          </div>
        </Html>

        {/* Screen */}
        <Html 
        className="screen"
          ref={screenRef}
          scale={1.06}
          occulude={'blending'}
          transform
          rotation={[-0.07, Math.PI * 0.063, 0.011]}
          position={[-42.1, -32.9, -141.45]}
        >
          <iframe
            width={1150}
            height={1000}
            src="https://preeminent-conkies-101504.netlify.app/"
            title="Interactive Screen"
            frameBorder={0}
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen=""
          />
        </Html>

        <primitive object={nodes.Scene} scale={40} />
      </group>
    </>
  )
}