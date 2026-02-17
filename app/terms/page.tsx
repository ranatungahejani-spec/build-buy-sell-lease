import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Terms and conditions content will be added here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
