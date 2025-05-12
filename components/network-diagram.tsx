"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Save, Upload, Trash2, Server, Laptop, Router, Database, HardDrive } from "lucide-react"
import { DeviceNode } from "@/components/device-node"
import { useToast } from "@/hooks/use-toast"

const nodeTypes: NodeTypes = {
  device: DeviceNode,
}

const initialNodes: Node[] = [
  {
    id: "1",
    type: "device",
    position: { x: 250, y: 100 },
    data: {
      label: "Router principale",
      type: "router",
      ip: "192.168.1.1",
      notes: "Gateway predefinito",
      services: "DHCP, DNS",
      containers: "",
    },
  },
  {
    id: "2",
    type: "device",
    position: { x: 100, y: 250 },
    data: {
      label: "Server Web",
      type: "server",
      ip: "192.168.1.10",
      notes: "Produzione",
      services: "Nginx, PHP",
      containers: "web-app, database",
    },
  },
]

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2", animated: true, label: "1Gbps" }]

function NetworkDiagramContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)

  // Stato locale per i form
  const [formState, setFormState] = useState({
    label: "",
    type: "server",
    ip: "",
    notes: "",
    services: "",
    containers: "",
  })

  const [edgeLabel, setEdgeLabel] = useState("")
  const reactFlowInstance = useReactFlow()
  const { toast } = useToast()

  // Aggiorna lo stato del form quando cambia il nodo selezionato
  useEffect(() => {
    if (selectedNode) {
      setFormState({
        label: selectedNode.data.label || "",
        type: selectedNode.data.type || "server",
        ip: selectedNode.data.ip || "",
        notes: selectedNode.data.notes || "",
        services: selectedNode.data.services || "",
        containers: selectedNode.data.containers || "",
      })
    }
  }, [selectedNode])

  // Aggiorna lo stato dell'etichetta dell'edge quando cambia l'edge selezionato
  useEffect(() => {
    if (selectedEdge) {
      setEdgeLabel((selectedEdge.label as string) || "")
    }
  }, [selectedEdge])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    // Aggiorna il nodo con i valori del form prima di deselezionarlo
    if (selectedNode) {
      updateNodeFromForm()
    }

    setSelectedNode(null)
    setSelectedEdge(null)
  }, [selectedNode])

  // Aggiorna solo lo stato del form, non il nodo
  const handleFormChange = useCallback((key: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  // Aggiorna il nodo con i valori del form
  const updateNodeFromForm = useCallback(() => {
    if (!selectedNode) return

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: formState.label,
              type: formState.type,
              ip: formState.ip,
              notes: formState.notes,
              services: formState.services,
              containers: formState.containers,
            },
          }
        }
        return node
      }),
    )
  }, [selectedNode, formState, setNodes])

  // Aggiorna il nodo quando il form perde il focus
  const handleBlur = useCallback(() => {
    updateNodeFromForm()
  }, [updateNodeFromForm])

  const updateEdgeData = useCallback(
    (value: string) => {
      if (!selectedEdge) return

      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === selectedEdge.id) {
            return {
              ...edge,
              label: value,
            }
          }
          return edge
        }),
      )
    },
    [selectedEdge, setEdges],
  )

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: "device",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: `Dispositivo ${nodes.length + 1}`,
        type: "server",
        ip: "",
        notes: "",
        services: "",
        containers: "",
      },
    }

    setNodes((nds) => [...nds, newNode])
  }, [nodes.length, setNodes])

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
      setSelectedNode(null)
    }

    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id))
      setSelectedEdge(null)
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges])

  const saveConfig = useCallback(() => {
    // Assicurati che il nodo selezionato sia aggiornato prima di salvare
    if (selectedNode) {
      updateNodeFromForm()
    }

    const data = {
      nodes: reactFlowInstance.getNodes(),
      edges: reactFlowInstance.getEdges(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "network-config.json"
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Configurazione salvata",
      description: "Il file network-config.json è stato scaricato",
    })
  }, [reactFlowInstance, toast, selectedNode, updateNodeFromForm])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadConfig = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.nodes && data.edges) {
            setNodes(data.nodes)
            setEdges(data.edges)
            toast({
              title: "Configurazione caricata",
              description: "La configurazione è stata caricata con successo",
            })
          }
        } catch (error) {
          toast({
            title: "Errore",
            description: "Impossibile caricare il file",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [setNodes, setEdges, toast],
  )

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "server":
        return <Server className="h-4 w-4" />
      case "laptop":
        return <Laptop className="h-4 w-4" />
      case "router":
        return <Router className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  // Previeni la propagazione degli eventi per il pannello laterale
  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="h-[calc(100vh-57px)] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
        <MiniMap />

        <Panel position="top-right" className="flex gap-2">
          <Button onClick={addNode} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Aggiungi dispositivo
          </Button>
          <Button onClick={deleteSelected} size="sm" variant="destructive" disabled={!selectedNode && !selectedEdge}>
            <Trash2 className="mr-1 h-4 w-4" /> Elimina selezionato
          </Button>
          <Button onClick={saveConfig} size="sm" variant="outline">
            <Save className="mr-1 h-4 w-4" /> Salva
          </Button>
          <Button onClick={loadConfig} size="sm" variant="outline">
            <Upload className="mr-1 h-4 w-4" /> Carica
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
        </Panel>
      </ReactFlow>

      {selectedNode && (
        <div
          className="absolute right-0 top-0 h-full w-80 border-l bg-background p-4 shadow-lg z-50"
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
          onKeyDown={stopPropagation}
        >
          <h3 className="mb-4 text-lg font-semibold">Configura dispositivo</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-name">Nome dispositivo</Label>
              <Input
                id="node-name"
                value={formState.label}
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
                onChange={(e) => handleFormChange("label", e.target.value)}
                onBlur={handleBlur}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-type">Tipo dispositivo</Label>
              <div className="flex items-center space-x-2">
                <select
                  id="node-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formState.type}
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  onBlur={handleBlur}
                >
                  <option value="server">Server</option>
                  <option value="router">Router</option>
                  <option value="laptop">Computer</option>
                  <option value="database">Database</option>
                  <option value="storage">Storage</option>
                </select>
                <div className="flex h-10 w-10 items-center justify-center rounded-md border">
                  {getDeviceIcon(formState.type)}
                </div>
              </div>
            </div>

            <Tabs defaultValue="basic" onMouseDown={stopPropagation}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" onClick={stopPropagation}>
                  Base
                </TabsTrigger>
                <TabsTrigger value="services" onClick={stopPropagation}>
                  Servizi
                </TabsTrigger>
                <TabsTrigger value="containers" onClick={stopPropagation}>
                  Container
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="node-ip">Indirizzo IP</Label>
                  <Input
                    id="node-ip"
                    value={formState.ip}
                    placeholder="es. 192.168.1.10"
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                    onChange={(e) => handleFormChange("ip", e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="node-notes">Note</Label>
                  <Textarea
                    id="node-notes"
                    value={formState.notes}
                    placeholder="Aggiungi note sul dispositivo..."
                    rows={4}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="node-services">Servizi</Label>
                  <Textarea
                    id="node-services"
                    value={formState.services}
                    placeholder="es. Nginx, MySQL, Redis..."
                    rows={6}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                    onChange={(e) => handleFormChange("services", e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
              </TabsContent>

              <TabsContent value="containers" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="node-containers">Container</Label>
                  <Textarea
                    id="node-containers"
                    value={formState.containers}
                    placeholder="es. web-app, database, cache..."
                    rows={6}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                    onChange={(e) => handleFormChange("containers", e.target.value)}
                    onBlur={handleBlur}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {selectedEdge && (
        <div
          className="absolute right-0 top-0 h-full w-80 border-l bg-background p-4 shadow-lg z-50"
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
          onKeyDown={stopPropagation}
        >
          <h3 className="mb-4 text-lg font-semibold">Configura connessione</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edge-label">Etichetta connessione</Label>
              <Input
                id="edge-label"
                value={edgeLabel}
                placeholder="es. 1Gbps, WiFi, VPN..."
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
                onChange={(e) => {
                  stopPropagation(e)
                  setEdgeLabel(e.target.value)
                }}
                onBlur={() => updateEdgeData(edgeLabel)}
              />
            </div>

            <Card onClick={stopPropagation}>
              <CardHeader>
                <CardTitle>Informazioni</CardTitle>
                <CardDescription>Dettagli sulla connessione</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Da: {nodes.find((n) => n.id === selectedEdge.source)?.data.label || selectedEdge.source}
                </p>
                <p className="text-sm">
                  A: {nodes.find((n) => n.id === selectedEdge.target)?.data.label || selectedEdge.target}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NetworkDiagram() {
  return (
    <ReactFlowProvider>
      <NetworkDiagramContent />
    </ReactFlowProvider>
  )
}
