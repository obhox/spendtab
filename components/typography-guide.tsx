'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function TypographyGuide() {
  const headingStyles = [
    { name: 'H1 Headline', class: 'text-h1', size: '96px', weight: 'Bold' },
    { name: 'H2 Headline', class: 'text-h2', size: '64px', weight: 'Bold' },
    { name: 'H3 Headline', class: 'text-h3', size: '48px', weight: 'Bold' },
    { name: 'H4 Headline', class: 'text-h4', size: '40px', weight: 'Bold' },
    { name: 'H5 Headline', class: 'text-h5', size: '32px', weight: 'Bold' },
    { name: 'H6 Headline', class: 'text-h6', size: '24px', weight: 'Bold' },
    { name: 'SubHeading', class: 'text-subheading', size: '18px', weight: 'Bold' },
  ]

  const bodyStyles = [
    { name: 'Body-Text', class: 'text-body', size: '16px', weight: 'Semi-Bold' },
    { name: 'Subtitle', class: 'text-subtitle', size: '14px', weight: 'Medium' },
    { name: 'Caption', class: 'text-caption', size: '12px', weight: 'Medium' },
  ]

  const responsiveStyles = [
    { name: 'Responsive H1', class: 'text-responsive-h1', description: 'Scales from H6 to H1 across breakpoints' },
    { name: 'Responsive H2', class: 'text-responsive-h2', description: 'Scales from H6 to H2 across breakpoints' },
    { name: 'Responsive H3', class: 'text-responsive-h3', description: 'Scales from SubHeading to H3 across breakpoints' },
  ]

  const scalingUtilities = [
    { name: 'Small Scale', class: 'text-scale-sm', description: 'xs → sm → base' },
    { name: 'Base Scale', class: 'text-scale-base', description: 'sm → base → lg' },
    { name: 'Large Scale', class: 'text-scale-lg', description: 'base → lg → xl' },
    { name: 'Extra Large Scale', class: 'text-scale-xl', description: 'lg → xl → 2xl' },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-h3">Typography Guide</h1>
        <p className="text-subtitle text-muted-foreground">
          Comprehensive typography system for SpendTab with consistent text scaling and responsive design.
        </p>
      </div>

      <Tabs defaultValue="headings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="body">Body Text</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
        </TabsList>

        <TabsContent value="headings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Heading Styles</CardTitle>
              <CardDescription>
                Primary heading styles with consistent sizing and weight
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {headingStyles.map((style, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{style.name}</Badge>
                      <span className="text-caption text-muted-foreground">{style.size}</span>
                      <span className="text-caption text-muted-foreground">{style.weight}</span>
                    </div>
                    <code className="text-caption bg-muted px-2 py-1 rounded">
                      {style.class}
                    </code>
                  </div>
                  <div className={style.class}>
                    {style.name}
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Body Text Styles</CardTitle>
              <CardDescription>
                Text styles for content, subtitles, and captions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {bodyStyles.map((style, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{style.name}</Badge>
                      <span className="text-caption text-muted-foreground">{style.size}</span>
                      <span className="text-caption text-muted-foreground">{style.weight}</span>
                    </div>
                    <code className="text-caption bg-muted px-2 py-1 rounded">
                      {style.class}
                    </code>
                  </div>
                  <div className={style.class}>
                    This is an example of {style.name.toLowerCase()} used for content throughout the application. 
                    It maintains readability while providing visual hierarchy.
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Typography</CardTitle>
              <CardDescription>
                Text that automatically scales across different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {responsiveStyles.map((style, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{style.name}</Badge>
                      <span className="text-caption text-muted-foreground">{style.description}</span>
                    </div>
                    <code className="text-caption bg-muted px-2 py-1 rounded">
                      {style.class}
                    </code>
                  </div>
                  <div className={style.class}>
                    {style.name} - Resize your browser to see the scaling effect
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scaling Utilities</CardTitle>
              <CardDescription>
                Utility classes for progressive text scaling across breakpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {scalingUtilities.map((utility, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{utility.name}</Badge>
                      <span className="text-caption text-muted-foreground">{utility.description}</span>
                    </div>
                    <code className="text-caption bg-muted px-2 py-1 rounded">
                      {utility.class}
                    </code>
                  </div>
                  <div className={utility.class}>
                    This text demonstrates {utility.name.toLowerCase()} scaling behavior
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>
                Common patterns and best practices for typography implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-h6">Page Headers</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`<h1 className="text-responsive-h1">Page Title</h1>`}
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-h6">Card Titles</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`<h2 className="text-h6">Card Title</h2>`}
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-h6">Body Content</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`<p className="text-body">Main content text</p>`}
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-h6">Responsive Scaling</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    {`<p className="text-scale-base">Responsive text</p>`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}