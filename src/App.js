import {useEffect, useState,useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF,Loader,Box,Html, useAnimations, useProgress, ScrollControls, SoftShadows, PerspectiveCamera, OrbitControls, Environment } from "@react-three/drei"
// import './App.css'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Model } from "./Model"
import * as THREE from 'three';
import { useControls } from 'leva'
import './styles.css'
import { Leva } from 'leva'





function App() {
      const isMobile = window.innerWidth < 768
  const { progress, loaded, total } = useProgress()


  useEffect(() => {
    // Get preloader elements
    const preloader = document.getElementById('preloader')
    const progressBar = document.getElementById('progress-bar')
    const progressText = document.getElementById('progress-text')
    
    // Update progress bar width and text
    if (progressBar && progressText) {
      progressBar.style.width = `${progress}%`
      // progressText.textContent = `${Math.round(progress)}% (${loaded}/${total} assets)`
    }
    
    console.log(progress)
    // Hide preloader when loading is complete
    if (progress === 100 ) {
      console.log( document.querySelector('.preloader'))

     document.querySelector('.preloader').classList.add('hide-preloader')
     
    }
  }, [progress, loaded, total])


  return (
    <>
    <div className="preloader">
<div id="load">
  <div>G</div>
  <div>N</div>
  <div>I</div>
  <div>D</div>
  <div>A</div>
  <div>O</div>
  <div>L</div>
</div>

<audio  id="audio">
  <source src="startup.mp3" type="audio/mp3" />

</audio>

    </div>
    <a href="https://x.com/Loomdotxyz" target="_blank"><i class="twitter-logo bi bi-twitter-x"></i></a>
    <button className="explore-btn">Explore</button>
        <button className="back-btn"><i class="bi bi-x"></i></button>

          <Leva  hidden />

    {/* <div className="enter-btn">Enter</div> */}
     <Canvas className="canvas" shadows gl={{ antialias: true,logarithmicDepthBuffer: true }} camera={{ position: [0, 2,isMobile ? 1530: 1400.5 ], fov: 50,near: 0.001,far: 10000 }}>
    <color attach="background" args={["black"]} />
        <fog attach="fog" args={["black", 300, 1000]} />

    {/* <fog attach="fog" args={["#f0f0f0", 0, 20]} /> */}
     {/* <ambientLight intensity={0.5} /> */}
    {/* <directionalLight intensity={0.1} position={[-6, 10, 6]} castShadow shadow-mapSize={2048} shadow-bias={-0.0001} /> */}


  
  
          <EffectComposer disableNormalPass >
        <Bloom luminanceThreshold={0.3} intensity={1.7} luminanceSmoothing={0.9} mipmapblur radius={0.8} />
      </EffectComposer>

      {/* <OrbitControls/> */}

<group position={[0,-2.5,0]}>


    <Suspense>

 
      <Model/>
         </Suspense>
</group>
      <Environment files={'environment.hdr'}/>

      {/* <Camera/> */}

   
    {/* <mesh rotation={[-0.5 * Math.PI, 0, 0]} position={[0, -1.01, 0]} receiveShadow>
      <planeBufferGeometry args={[10, 10, 1, 1]} />
      
    </mesh> */}
    {/* <SoftShadows size={40} samples={16} /> */}

    {/* <Gltf src="model.glb" receiveShadow castShadow/> */}
    
  </Canvas>

    </>
  )
}

export default App
