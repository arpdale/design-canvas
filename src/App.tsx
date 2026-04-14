import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@david-richard/ds-blossom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ds-blossom demo</CardTitle>
          <CardDescription>
            Consuming <code>@david-richard/ds-blossom</code> from npm.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" placeholder="Design leader" />
          </div>
          <Button onClick={() => setCount((c) => c + 1)}>
            Clicked {count} times
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
