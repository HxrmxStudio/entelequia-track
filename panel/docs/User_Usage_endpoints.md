# Proof Service

Servicio para crear pruebas de entrega (POD - Proof of Delivery) en el sistema de envíos.

## Uso

```typescript
import { postProof, type ProofCreatePayload } from "@/services/proofs";

// Crear proof con OTP
const otpProof: ProofCreatePayload = {
  method: "otp",
  lat: -34.6037,
  lon: -58.3816,
  captured_at: new Date().toISOString(),
  photo: photoFile, // File object
  otp: "123456"
};

try {
  const result = await postProof("shipment-uuid", otpProof);
  console.log("Proof creado:", result.proof_id);
} catch (error) {
  console.error("Error:", error);
}
```

## Métodos Soportados

- **otp**: Requiere campo `otp` con el código de verificación
- **qr**: Requiere campo `qr_payload` con el contenido del QR escaneado
- **photo**: Solo requiere foto (método más simple)
- **signature**: Requiere campo `signature_svg` con la firma en formato SVG

## Validaciones del Backend

- Foto es **requerida** para todos los métodos
- Coordenadas GPS deben estar dentro del radio de entrega
- OTP debe ser válido y no estar bloqueado
- QR debe coincidir con el token del envío
- Firma SVG es requerida para método "signature"

## Respuesta

```typescript
interface ProofResponse {
  ok: boolean;
  proof_id: string;
  photo_url: string;
}
```

## Errores Comunes

- `"Photo is required"`: No se envió foto
- `"Outside delivery radius"`: Coordenadas fuera del radio permitido
- `"otp_invalid"`: Código OTP incorrecto
- `"qr_mismatch"`: QR no coincide con el envío
- `"proof_creation_failed"`: Error interno del servidor
