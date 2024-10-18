
import React from 'react'
import { useGLTF } from '@react-three/drei'

const Casco3d = (props) => {
  // props contendrá { position: helmetPosition }
  const { nodes, materials } = useGLTF('/casco.gltf');

  return (
    <group {...props} dispose={null} scale={[0.1, 0.1, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={nodes.Object_2.geometry} material={materials['Scene_-_Root']} />
    </group>
  );
};


useGLTF.preload('/casco.gltf')

export default Casco3d