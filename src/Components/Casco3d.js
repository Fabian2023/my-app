
import React from 'react'
import { useGLTF } from '@react-three/drei'

const  Casco3d =(props)=> {
  const { nodes, materials } = useGLTF('/casco.gltf')
  return (
    <group {...props} dispose={null} scale={[0.2, 0.2, 0.2]} position={[2, 0, 3]} >
      <mesh geometry={nodes.Object_2.geometry} material={materials['Scene_-_Root']} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  )
}

useGLTF.preload('/casco.gltf')

export default Casco3d