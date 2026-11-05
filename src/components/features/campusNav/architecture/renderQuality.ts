import * as THREE from 'three';

export interface RenderQualityProfile {
  isEmbeddedOrPi: boolean;
  basePixelRatio: number;
  minPixelRatio: number;
  shadowMapSize: number;
  shadowMapType: THREE.ShadowMapType;
  antialias: boolean;
  showDebugOverlay: boolean;
}

/**
 * Detects whether the kiosk is running on a Raspberry Pi 5 (VideoCore VII / V3D / ARM Linux)
 * or if a quality override (?quality=pi | ?quality=low | ?quality=high) is present in the URL.
 */
export function detectRenderQualityProfile(gl?: WebGLRenderingContext | WebGL2RenderingContext): RenderQualityProfile {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const qualityParam = params?.get('quality')?.toLowerCase();
  const showDebugOverlay = params?.get('debug') === '1';

  let gpuRenderer = '';
  if (gl) {
    const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbgInfo) {
      gpuRenderer = String(gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) || '');
    } else {
      gpuRenderer = String(gl.getParameter(gl.RENDERER) || '');
    }
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? navigator.platform : '';
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;

  const isPiOrEmbeddedGpu =
    qualityParam === 'pi' ||
    qualityParam === 'low' ||
    /V3D|VideoCore|Broadcom|Mesa|llvmpipe|Panfrost|Lima|Mali/i.test(gpuRenderer) ||
    /aarch64|armv8|armv7|Linux arm/i.test(`${ua} ${platform}`) ||
    cores <= 4;

  const forceHigh = qualityParam === 'high';
  const isEmbeddedOrPi = !forceHigh && isPiOrEmbeddedGpu;

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  if (isEmbeddedOrPi) {
    return {
      isEmbeddedOrPi: true,
      basePixelRatio: 1.0,
      minPixelRatio: 0.85,
      shadowMapSize: 1024,
      shadowMapType: THREE.PCFShadowMap,
      antialias: true,
      showDebugOverlay,
    };
  }

  return {
    isEmbeddedOrPi: false,
    basePixelRatio: Math.min(dpr, 1.5),
    minPixelRatio: 1.0,
    shadowMapSize: 1536,
    shadowMapType: THREE.PCFSoftShadowMap,
    antialias: true,
    showDebugOverlay,
  };
}

/**
 * Monitors frame times during active rendering and dynamically adjusts pixelRatio
 * between `minPixelRatio` and `basePixelRatio` if FPS drops below 28.
 */
export class AdaptiveResolutionController {
  private currentPixelRatio: number;
  private readonly basePixelRatio: number;
  private readonly minPixelRatio: number;
  private frameCount = 0;
  private accumTime = 0;
  private currentFps = 60;

  constructor(profile: RenderQualityProfile) {
    this.basePixelRatio = profile.basePixelRatio;
    this.minPixelRatio = profile.minPixelRatio;
    this.currentPixelRatio = profile.basePixelRatio;
  }

  public recordFrame(deltaSeconds: number, renderer: THREE.WebGLRenderer): number {
    if (deltaSeconds <= 0 || deltaSeconds > 0.5) return this.currentFps;

    this.frameCount++;
    this.accumTime += deltaSeconds;

    if (this.accumTime >= 1.5) {
      this.currentFps = Math.round(this.frameCount / this.accumTime);
      this.frameCount = 0;
      this.accumTime = 0;

      if (this.currentFps < 28 && this.currentPixelRatio > this.minPixelRatio) {
        this.currentPixelRatio = this.minPixelRatio;
        renderer.setPixelRatio(this.currentPixelRatio);
      } else if (this.currentFps > 46 && this.currentPixelRatio < this.basePixelRatio) {
        this.currentPixelRatio = this.basePixelRatio;
        renderer.setPixelRatio(this.currentPixelRatio);
      }
    }

    return this.currentFps;
  }

  public getFps(): number {
    return this.currentFps;
  }
}

