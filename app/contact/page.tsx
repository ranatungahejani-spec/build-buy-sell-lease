import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Contact information and form will be added here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
