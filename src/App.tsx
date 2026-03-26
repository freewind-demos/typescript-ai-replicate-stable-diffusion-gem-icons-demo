/**
 * AI 宝石图标生成器
 *
 * 参数配置文档:
 * ────────────────────────────────────────────────────────────────────────
 *
 * 【API 配置】
 * - 服务: Replicate (https://replicate.com)
 * - 模型: stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b
 * - 费用: 约 $0.01-0.02/次
 *
 * 【生成参数】
 * ┌─────────────────┬──────────────┬────────────────────────────────────┐
 * │ 参数            │ 推荐值        │ 说明                                │
 * ├─────────────────┼──────────────┼────────────────────────────────────┤
 * │ width/height    │ 1024x1024    │ 图片尺寸，图标建议 1024            │
 * │ num_inference_steps │ 30       │ 推理步数，越多越精细但越慢         │
 * │ guidance_scale  │ 7.5          │ 提示词引导强度，7-10 效果较好      │
 * └─────────────────┴──────────────┴────────────────────────────────────┘
 *
 * 【Prompt 模板】
 * 正向: "exquisite {宝石类型} gemstone, {切工}, {颜色}, sparkling reflections,
 *       transparent crystal, detailed facets, white background, studio lighting,
 *       highly detailed, 3d render, icon design, clean minimal style"
 *
 * 反向: "ugly, blurry, low quality, dark background, realistic photo,
 *       watermark, text, logo"
 *
 * 【宝石类型】
 * - ruby (红宝石), emerald (祖母绿), sapphire (蓝宝石)
 * - diamond (钻石), amethyst (紫水晶), topaz (黄玉)
 *
 * 【风格选项】
 * - icon: 图标风格 - clean minimal style, 3d render
 * - realistic: 写实风格 - photorealistic, professional photography
 * - cartoon: 卡通风格 - cartoon style, kawaii, cute
 * - crystal: 水晶风格 - ice-like, magical sparkle, ethereal glow
 *
 * ────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { ConfigProvider, Layout, Form, Input, Button, Select, Slider, Card, Row, Col, Image, Typography, Space, Tag, Progress, Alert, Divider, message, Result } from 'antd'
import { PlayCircleOutlined, DeleteOutlined, CopyOutlined, CheckCircleFilled } from '@ant-design/icons'
import './App.css'

const { Header, Content } = Layout
const { Title, Text } = Typography

const GEM_OPTIONS = [
  { label: '红宝石 (Ruby)', value: 'ruby', color: '#e0115f' },
  { label: '祖母绿 (Emerald)', value: 'emerald', color: '#50c878' },
  { label: '蓝宝石 (Sapphire)', value: 'sapphire', color: '#0f52ba' },
  { label: '钻石 (Diamond)', value: 'diamond', color: '#b9f2ff' },
  { label: '紫水晶 (Amethyst)', value: 'amethyst', color: '#9966cc' },
  { label: '黄玉 (Topaz)', value: 'topaz', color: '#ffc87c' },
]

const STYLE_OPTIONS = [
  { label: '精美图标风格', value: 'icon' },
  { label: '写实风格', value: 'realistic' },
  { label: '卡通风格', value: 'cartoon' },
  { label: '水晶透明风格', value: 'crystal' },
]

interface GeneratedImage {
  id: string
  gem: string
  style: string
  url: string
  prompt: string
  negativePrompt: string
}

// 默认 Prompt 模板（中文）
const DEFAULT_PROMPTS: Record<string, Record<string, { prompt: string; negativePrompt: string }>> = {
  ruby: {
    icon: { prompt: '精美的红宝石图标，明亮式切工，深红色，闪耀光泽，透明水晶，精细刻面，透明背景，工作室灯光，高度详细，3D渲染，图标设计，简洁风格', negativePrompt: '丑陋，模糊，低质量，写实照片，水印，文字，logo' },
    realistic: { prompt: '逼真的红宝石照片，详细纹理，自然光线，高分辨率，专业摄影，红宝石特写', negativePrompt: '丑陋，模糊，低质量，卡通风格，水印，文字，logo' },
    cartoon: { prompt: '卡通红宝石，可爱，Q版，简单背景，平面颜色，卡通风格，角色设计', negativePrompt: '逼真，低质量，水印，文字，logo' },
    crystal: { prompt: '透明水晶，冰晶状，折射光线，魔法闪耀，飘渺光晕，详细内部反射，水晶风格', negativePrompt: '模糊，低质量，暗色背景，水印，文字，logo' },
  },
  emerald: {
    icon: { prompt: '精美的祖母绿图标，祖母绿式切工，翠绿色，闪耀光泽，透明水晶，精细刻面，透明背景，工作室灯光，高度详细，3D渲染，图标设计，简洁风格', negativePrompt: '丑陋，模糊，低质量，写实照片，水印，文字，logo' },
    realistic: { prompt: '逼真的祖母绿照片，详细纹理，自然光线，高分辨率，专业摄影，祖母绿特写', negativePrompt: '丑陋，模糊，低质量，卡通风格，水印，文字，logo' },
    cartoon: { prompt: '卡通祖母绿，可爱，Q版，简单背景，平面颜色，卡通风格，角色设计', negativePrompt: '逼真，低质量，水印，文字，logo' },
    crystal: { prompt: '透明水晶，冰晶状，折射光线，魔法闪耀，飘渺光晕，详细内部反射，水晶风格', negativePrompt: '模糊，低质量，暗色背景，水印，文字，logo' },
  },
  sapphire: {
    icon: { prompt: '精美的蓝宝石图标，明亮式切工，皇家蓝色，闪耀光泽，透明水晶，精细刻面，透明背景，工作室灯光，高度详细，3D渲染，图标设计，简洁风格', negativePrompt: '丑陋，模糊，低质量，写实照片，水印，文字，logo' },
    realistic: { prompt: '逼真的蓝宝石照片，详细纹理，自然光线，高分辨率，专业摄影，蓝宝石特写', negativePrompt: '丑陋，模糊，低质量，卡通风格，水印，文字，logo' },
    cartoon: { prompt: '卡通蓝宝石，可爱，Q版，简单背景，平面颜色，卡通风格，角色设计', negativePrompt: '逼真，低质量，水印，文字，logo' },
    crystal: { prompt: '透明水晶，冰晶状，折射光线，魔法闪耀，飘渺光晕，详细内部反射，水晶风格', negativePrompt: '模糊，低质量，暗色背景，水印，文字，logo' },
  },
  diamond: {
    icon: { prompt: '精美的钻石图标，明亮式切工，纯白色光泽，彩虹光线反射，透明水晶，精细刻面，透明背景，工作室灯光，高度详细，3D渲染，图标设计，简洁风格', negativePrompt: '丑陋，模糊，低质量，写实照片，水印，文字，logo' },
    realistic: { prompt: '逼真的钻石照片，详细纹理，自然光线，高分辨率，专业摄影，钻石特写，彩虹反射', negativePrompt: '丑陋，模糊，低质量，卡通风格，水印，文字，logo' },
    cartoon: { prompt: '卡通钻石，可爱，Q版，简单背景，平面颜色，卡通风格，角色设计', negativePrompt: '逼真，低质量，水印，文字，logo' },
    crystal: { prompt: '透明水晶，冰晶状，折射光线，魔法闪耀，飘渺光晕，详细内部反射，彩虹光芒', negativePrompt: '模糊，低质量，暗色背景，水印，文字，logo' },
  },
  amethyst: {
    icon: { prompt: '精美的紫水晶图标，明亮式切工，深紫色，闪耀光泽，透明水晶，精细刻面，透明背景，工作室灯光，高度详细，3D渲染，图标设计，简洁风格', negativePrompt: '丑陋，模糊，低质量，写实照片，水印，文字，logo' },
    realistic: { prompt: '逼真的紫水晶照片，详细纹理，自然光线，高分辨率，专业摄影，紫水晶特写', negativePrompt: '丑陋，模糊，低质量，卡通风格，水印，文字，logo' },
    cartoon: { prompt: '卡通紫水晶，可爱，Q版，简单背景，平面颜色，卡通风格，角色设计', negativePrompt: '逼真，低质量，水印，文字，logo' },
    crystal: { prompt: '透明水晶，冰晶状，折射光线，魔法闪耀，飘渺光晕，详细内部反射，水晶风格', negativePrompt: '模糊，低质量，暗色背景，水印，文字，logo' },
  },
  topaz: {
    icon: { prompt: '精美的黄玉图标，明亮式切工，金黄色，闪耀光泽，透明水晶，精细刻面，透明背景，工作室灯光，高度详细，3D渲染，图标设计，简洁风格', negativePrompt: '丑陋，模糊，低质量，写实照片，水印，文字，logo' },
    realistic: { prompt: '逼真的黄玉照片，详细纹理，自然光线，高分辨率，专业摄影，黄玉特写', negativePrompt: '丑陋，模糊，低质量，卡通风格，水印，文字，logo' },
    cartoon: { prompt: '卡通黄玉，可爱，Q版，简单背景，平面颜色，卡通风格，角色设计', negativePrompt: '逼真，低质量，水印，文字，logo' },
    crystal: { prompt: '透明水晶，冰晶状，折射光线，魔法闪耀，飘渺光晕，详细内部反射，水晶风格', negativePrompt: '模糊，低质量，暗色背景，水印，文字，logo' },
  },
}

function App() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // 自定义的 Prompt（用户可编辑）
  const [customPrompts, setCustomPrompts] = useState<Record<string, { prompt: string; negativePrompt: string }>>({})

  // 监听表单值变化，用于实时预览 Prompt
  const selectedGems = Form.useWatch('gems', form) || []
  const selectedStyle = Form.useWatch('style', form) || 'icon'

  const getPrompt = (gem: string, style: string): { prompt: string; negativePrompt: string } => {
    const key = `${gem}-${style}`
    // 优先使用用户自定义的 Prompt
    if (customPrompts[key]) {
      return customPrompts[key]
    }
    // 否则使用默认的 Prompt
    return DEFAULT_PROMPTS[gem]?.[style] || { prompt: '', negativePrompt: '' }
  }

  const updateCustomPrompt = (gem: string, style: string, field: 'prompt' | 'negativePrompt', value: string) => {
    const key = `${gem}-${style}`
    setCustomPrompts(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  const generateImage = async (gem: string, style: string, token: string) => {
    const { prompt, negativePrompt } = getPrompt(gem, style)

    setStatusText(`正在生成 ${GEM_OPTIONS.find(g => g.value === gem)?.label}...`)
    setProgress(10)

    const model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'

    setProgress(30)

    // 创建预测
    const createResponse = await fetch('/api/replicate/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model,
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`API 请求失败: ${createResponse.status} ${createResponse.statusText}\n${errorText}`)
    }

    const prediction = await createResponse.json()
    const predictionId = prediction.id

    setProgress(50)
    setStatusText(`等待生成结果...`)

    // 轮询预测状态
    let outputUrl: string = ''
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`/api/replicate/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!statusResponse.ok) {
        throw new Error(`获取状态失败: ${statusResponse.status}`)
      }

      const statusResult = await statusResponse.json()

      if (statusResult.status === 'succeeded') {
        outputUrl = statusResult.output
        if (Array.isArray(outputUrl)) {
          outputUrl = outputUrl[0]
        }
        break
      } else if (statusResult.status === 'failed') {
        throw new Error(`生成失败: ${statusResult.error}`)
      }

      setProgress(50 + Math.round((i / 60) * 30))
    }

    if (!outputUrl) {
      throw new Error('生成超时，请重试')
    }

    setProgress(100)

    return {
      id: `${gem}-${style}-${Date.now()}`,
      gem,
      style,
      url: outputUrl,
      prompt,
      negativePrompt,
    }
  }

  const handleGenerate = async (values: { token: string; gems: string[]; style: string }) => {
    setErrorMessage('')
    if (!values.token) {
      setErrorMessage('请输入 Replicate API Token')
      return
    }
    if (!values.gems || values.gems.length === 0) {
      setErrorMessage('请选择至少一种宝石')
      return
    }

    setLoading(true)
    setGeneratedImages([])
    setProgress(0)
    setStatusText('开始生成...')

    const results: GeneratedImage[] = []

    try {
      for (let i = 0; i < values.gems.length; i++) {
        const gem = values.gems[i]
        setCurrentGenerating(gem)

        const result = await generateImage(gem, values.style, values.token)
        results.push(result)
        setGeneratedImages([...results])

        setProgress(Math.round(((i + 1) / values.gems.length) * 100))
      }

      setStatusText('全部生成完成!')
      message.success(`成功生成 ${results.length} 张图片`)
    } catch (error: unknown) {
      const errorDetail = error instanceof Error ? error.message : '未知错误'
      setErrorMessage(`生成失败: ${errorDetail}`)
      setStatusText('生成失败')
    } finally {
      setLoading(false)
      setCurrentGenerating(null)
    }
  }

  const handleClear = () => {
    setGeneratedImages([])
    setProgress(0)
    setStatusText('')
    setErrorMessage('')
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    message.success('Prompt 已复制到剪贴板')
  }

  return (
    <ConfigProvider>
      <Layout className="app-layout">
        <Header className="app-header">
          <Title level={3} style={{ margin: 0, color: '#fff' }}>
            💎 AI 宝石图标生成器
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            使用 Stable Diffusion SDXL 模型生成精美宝石图标
          </Text>
        </Header>

        <Content className="app-content">
          <Row gutter={[24, 24]}>
            {/* 左侧配置面板 */}
            <Col xs={24} lg={8}>
              <Card className="config-card" title="配置参数">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    gems: ['ruby'],
                    style: 'icon',
                    background: 'transparent',
                  }}
                  onFinish={handleGenerate}
                >
                  <Form.Item
                    label="Replicate API Token"
                    name="token"
                    rules={[{ required: true, message: '请输入 API Token' }]}
                    extra={
                      <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer">
                        获取 Token
                      </a>
                    }
                  >
                    <Input.Password placeholder="r8_xxxxxxxxxxxxx" />
                  </Form.Item>

                  <Form.Item label="选择宝石类型" name="gems" rules={[{ required: true, message: '请选择宝石' }]}>
                    <Select mode="multiple" placeholder="选择宝石类型" options={GEM_OPTIONS} />
                  </Form.Item>

                  <Form.Item label="生成风格" name="style">
                    <Select placeholder="选择风格" options={STYLE_OPTIONS} />
                  </Form.Item>

                  <Form.Item label="图片尺寸 (width/height)" name="size">
                    <Select
                      placeholder="选择尺寸"
                      options={[
                        { label: '64 x 64 (小图标)', value: 64 },
                        { label: '128 x 128 (图标)', value: 128 },
                        { label: '256 x 256 (中图标)', value: 256 },
                        { label: '512 x 512 (大图标)', value: 512 },
                      ]}
                      defaultValue={512}
                    />
                  </Form.Item>

                  <Form.Item label="推理步数 (num_inference_steps)" name="steps" extra="步数越多质量越高，但生成越慢">
                    <Slider min={10} max={50} defaultValue={30} marks={{ 10: '10', 30: '30', 50: '50' }} />
                  </Form.Item>

                  <Form.Item label="引导强度 (guidance_scale)" name="guidance">
                    <Slider min={1} max={15} defaultValue={7.5} marks={{ 1: '1', 7.5: '7.5', 15: '15' }} />
                  </Form.Item>

                  <Divider />

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<PlayCircleOutlined />}
                      loading={loading}
                      block
                      size="large"
                    >
                      {loading ? '生成中...' : '开始生成'}
                    </Button>

                    {generatedImages.length > 0 && (
                      <Button icon={<DeleteOutlined />} onClick={handleClear} block>
                        清除结果
                      </Button>
                    )}
                  </Space>
                </Form>

                {loading && (
                  <Alert
                    type="info"
                    showIcon
                    icon={<Progress percent={progress} status="active" size="small" />}
                    message={statusText}
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            </Col>

            {/* 右侧结果展示 */}
            <Col xs={24} lg={16}>
              {/* 使用说明 */}
              <Card title="使用说明" styles={{ body: { padding: '12px 16px' }}}>
                <Space direction="vertical" size="small">
                  <Text>
                    1. 在 <a href="https://replicate.com" target="_blank" rel="noopener noreferrer">Replicate</a> 注册账号
                  </Text>
                  <Text>2. 获取 API Token 并粘贴到上方输入框</Text>
                  <Text>3. 选择要生成的宝石类型（可多选）</Text>
                  <Text>4. 选择生成风格并点击开始生成</Text>
                  <Alert
                    type="info"
                    message="费用说明"
                    description="SDXL 模型约 $0.01-0.02/次，生成 6 张大约 $0.06-0.12，按需付费"
                    style={{ marginTop: 8 }}
                  />
                </Space>
              </Card>

              {/* Prompt 预览 */}
              <Card title="Prompt 预览（可编辑）" styles={{ body: { padding: '12px 16px' }}}>
                {selectedGems.length > 0 ? (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {selectedGems.map((gem: string) => {
                      const { prompt, negativePrompt } = getPrompt(gem, selectedStyle)
                      const key = `${gem}-${selectedStyle}`
                      return (
                        <Card key={key} size="small" styles={{ body: { padding: '12px' }}}>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <Tag color={GEM_OPTIONS.find(g => g.value === gem)?.color}>
                                {GEM_OPTIONS.find(g => g.value === gem)?.label}
                              </Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>正向提示词 (prompt 参数)</Text>
                            </Space>
                            <Input.TextArea
                              value={prompt}
                              onChange={(e) => updateCustomPrompt(gem, selectedStyle, 'prompt', e.target.value)}
                              autoSize={{ minRows: 2, maxRows: 4 }}
                              style={{ fontSize: 12 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>反向提示词 (negative_prompt 参数)</Text>
                            <Input.TextArea
                              value={negativePrompt}
                              onChange={(e) => updateCustomPrompt(gem, selectedStyle, 'negativePrompt', e.target.value)}
                              autoSize={{ minRows: 1, maxRows: 2 }}
                              style={{ fontSize: 12 }}
                            />
                          </Space>
                        </Card>
                      )
                    })}
                  </Space>
                ) : (
                  <Text type="secondary">选择宝石类型后，这里将显示对应的 Prompt</Text>
                )}
              </Card>

              <Card title="生成结果" styles={{ body: { minHeight: 200 }}}>
                {errorMessage && (
                  <Alert
                    type="error"
                    message="错误"
                    description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{errorMessage}</pre>}
                    style={{ marginBottom: 16 }}
                    closable
                    onClose={() => setErrorMessage('')}
                  />
                )}
                {generatedImages.length === 0 ? (
                  <Result status="info" title="等待生成" subTitle="配置参数后点击生成，图片将显示在这里" />
                ) : (
                  <Row gutter={[16, 16]}>
                    {generatedImages.map((img) => (
                      <Col xs={24} sm={12} md={8} key={img.id}>
                        <Card
                          hoverable
                          cover={
                            <div className="image-wrapper">
                              <Image src={img.url} alt={img.gem} preview />
                              {currentGenerating === img.gem && (
                                <div className="generating-overlay">
                                  <Progress type="circle" percent={progress} size={40} />
                                </div>
                              )}
                            </div>
                          }
                          actions={[
                            <CopyOutlined key="copy" onClick={() => handleCopyPrompt(img.prompt)} />,
                          ]}
                        >
                          <Card.Meta
                            title={
                              <Space>
                                {GEM_OPTIONS.find(g => g.value === img.gem)?.label || img.gem}
                                <Tag color={STYLE_OPTIONS.find(s => s.value === img.style)?.value === 'icon' ? 'blue' : 'green'}>
                                  {STYLE_OPTIONS.find(s => s.value === img.style)?.label}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Text type="secondary" ellipsis>
                                {img.prompt}
                              </Text>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}

                {generatedImages.length > 0 && (
                  <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleFilled />}
                    message={<Text>共生成 {generatedImages.length} 张图片</Text>}
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>

              {/* Prompt 展示区 */}
              {generatedImages.length > 0 && (
                <Card title="使用的 Prompts" styles={{ body: { padding: '12px 16px' }}}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {generatedImages.map((img) => (
                      <Alert
                        key={img.id}
                        type="info"
                        showIcon
                        icon={<Tag color={GEM_OPTIONS.find(g => g.value === img.gem)?.color}>{GEM_OPTIONS.find(g => g.value === img.gem)?.label}</Tag>}
                        message={<Text copyable={{ text: img.prompt }}>{img.prompt}</Text>}
                      />
                    ))}
                  </Space>
                </Card>
              )}
            </Col>
          </Row>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App
