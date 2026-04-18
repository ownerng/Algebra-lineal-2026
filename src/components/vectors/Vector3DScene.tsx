import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { VecOpKind } from '../../engine/types'

type V3 = [number, number, number]

interface ArrowProps {
  from?: V3
  to: V3
  color: string
  label?: string
  opacity?: number
  animate?: boolean
}

function Arrow({ from = [0, 0, 0], to, color, label, opacity = 1, animate = false }: ArrowProps) {
  const groupRef = useRef<THREE.Group>(null)
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2])
  const length = dir.length()

  useFrame(({ clock }) => {
    if (animate && groupRef.current) {
      groupRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.3
        }
      })
    }
  })

  if (length < 0.001) return null

  const normalized = dir.clone().normalize()
  const arrowHelper = useMemo(() => new THREE.ArrowHelper(
    normalized,
    new THREE.Vector3(...from),
    length,
    color,
    Math.min(0.3, length * 0.25),
    Math.min(0.15, length * 0.12),
  ), [from[0], from[1], from[2], to[0], to[1], to[2], color, length])

  const midpoint: V3 = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.15,
    (from[2] + to[2]) / 2,
  ]

  return (
    <group ref={groupRef}>
      <primitive object={arrowHelper} />
      {label && (
        <Text
          position={midpoint}
          fontSize={0.22}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#0E0E0F"
        >
          {label}
        </Text>
      )}
    </group>
  )
}

function AxisLabels() {
  return (
    <>
      <Text position={[3.4, 0, 0]} fontSize={0.22} color="#6B6B7A" anchorX="center">x</Text>
      <Text position={[0, 3.4, 0]} fontSize={0.22} color="#6B6B7A" anchorX="center">y</Text>
      <Text position={[0, 0, 3.4]} fontSize={0.22} color="#6B6B7A" anchorX="center">z</Text>
    </>
  )
}

function Axes() {
  const mat = new THREE.LineBasicMaterial({ color: '#2A2A2F', transparent: true, opacity: 0.8 })
  const pts = (a: V3, b: V3) => [new THREE.Vector3(...a), new THREE.Vector3(...b)]

  return (
    <>
      <Line points={pts([-3, 0, 0], [3, 0, 0])} color="#2A2A2F" lineWidth={1} />
      <Line points={pts([0, -3, 0], [0, 3, 0])} color="#2A2A2F" lineWidth={1} />
      <Line points={pts([0, 0, -3], [0, 0, 3])} color="#2A2A2F" lineWidth={1} />
      <AxisLabels />
    </>
  )
}

interface SceneProps {
  vecA: V3
  vecB: V3
  result: V3 | null
  op: VecOpKind
  highlightA: boolean
  highlightB: boolean
  highlightResult: boolean
  showParallelogram: boolean
}

function SceneContent({ vecA, vecB, result, op, highlightA, highlightB, highlightResult, showParallelogram }: SceneProps) {
  const showResult = result && highlightResult
  const showA = vecA.some(v => v !== 0)
  const showB = vecB.some(v => v !== 0) && op !== VecOpKind.Scale && op !== VecOpKind.Normalize

  const parallelogramPts = useMemo(() => {
    if (!showParallelogram || !showA || !showB) return null
    return [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(...vecA),
      new THREE.Vector3(vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]),
      new THREE.Vector3(...vecB),
      new THREE.Vector3(0, 0, 0),
    ]
  }, [vecA, vecB, showParallelogram, showA, showB])

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 8, 5]} intensity={1} />
      <pointLight position={[-5, -4, -5]} intensity={0.3} color="#5B8AF0" />

      <Axes />

      {showA && (
        <Arrow
          to={vecA}
          color={highlightA ? '#5B8AF0' : '#3A5FAD'}
          label="a"
          opacity={highlightA ? 1 : 0.6}
          animate={highlightA}
        />
      )}

      {showB && (
        <Arrow
          to={vecB}
          color={highlightB ? '#3DAA72' : '#2A7A52'}
          label="b"
          opacity={highlightB ? 1 : 0.6}
          animate={highlightB}
        />
      )}

      {/* Ghost de A desplazado a b (para suma/resta) */}
      {(op === VecOpKind.Add || op === VecOpKind.Sub) && showResult && showA && showB && (
        <Arrow
          from={vecB}
          to={[vecB[0] + vecA[0], vecB[1] + vecA[1], vecB[2] + vecA[2]]}
          color="#5B8AF0"
          opacity={0.35}
        />
      )}

      {/* Líneas del paralelogramo para Add */}
      {parallelogramPts && (op === VecOpKind.Add) && showResult && (
        <Line
          points={parallelogramPts}
          color="#2A2A2F"
          lineWidth={1}
          dashed
          dashScale={5}
        />
      )}

      {showResult && result && (
        <Arrow
          to={result}
          color="#D4884A"
          label="r"
          animate={true}
        />
      )}
    </>
  )
}

interface Props {
  vecA: V3
  vecB: V3
  result: V3 | null
  op: VecOpKind
  highlightA?: boolean
  highlightB?: boolean
  highlightResult?: boolean
}

export default function Vector3DScene({ vecA, vecB, result, op, highlightA = true, highlightB = true, highlightResult = false }: Props) {
  const showParallelogram = op === VecOpKind.Add || op === VecOpKind.Sub

  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 50 }}
      style={{ background: '#0E0E0F', borderRadius: '12px' }}
      gl={{ antialias: true, alpha: false }}
    >
      <SceneContent
        vecA={vecA}
        vecB={vecB}
        result={result}
        op={op}
        highlightA={highlightA}
        highlightB={highlightB}
        highlightResult={highlightResult}
        showParallelogram={showParallelogram}
      />
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={12}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  )
}
