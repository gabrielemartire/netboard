import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Server, Laptop, Router, Database, HardDrive } from "lucide-react"

export const DeviceNode = memo(({ data, isConnectable }: NodeProps) => {
  const getDeviceIcon = () => {
    switch (data.type) {
      case "server":
        return <Server className="h-5 w-5" />
      case "laptop":
        return <Laptop className="h-5 w-5" />
      case "router":
        return <Router className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      default:
        return <HardDrive className="h-5 w-5" />
    }
  }

  return (
    <div className="relative flex min-w-[180px] flex-col rounded-md border bg-card p-3 shadow-sm">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!h-3 !w-3 !bg-primary" />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{getDeviceIcon()}</div>
        <div className="font-medium">{data.label}</div>
      </div>

      {data.ip && <div className="mt-2 rounded-sm bg-muted px-2 py-1 text-xs">IP: {data.ip}</div>}

      {data.notes && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{data.notes}</div>}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !bg-primary"
      />
    </div>
  )
})

DeviceNode.displayName = "DeviceNode"
