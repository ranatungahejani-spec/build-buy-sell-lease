import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Privacy policy content will be added here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
