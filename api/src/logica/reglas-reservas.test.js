import { describe, it, expect } from 'vitest';
import {
  calcularDuracionHoras, validarFechas, validarAsistentes, hayConflicto, calcularResumen
} from './reglas-reservas';

describe('calcularDuracionHoras', () => {
  it('calcula la duración en horas', () => {
    expect(calcularDuracionHoras('2026-12-01T08:00:00', '2026-12-01T10:00:00')).toBe(2);
  });
});

describe('validarFechas', () => {
  it('rechaza un fin anterior al inicio', () => {
    expect(validarFechas('2026-12-01T10:00:00', '2026-12-01T08:00:00')).toBe(false);
  });
  it('acepta la duración máxima exacta de 12 horas', () => {
    expect(validarFechas('2026-12-01T08:00:00', '2026-12-01T20:00:00')).toBe(true);
  });
  it('rechaza una duración mayor a 12 horas', () => {
    expect(validarFechas('2026-12-01T08:00:00', '2026-12-01T20:30:00')).toBe(false);
  });
});

describe('validarAsistentes', () => {
  it('rechaza cero asistentes', () => {
    expect(validarAsistentes(0)).toBe(false);
  });
});

describe('hayConflicto', () => {
  const existentes = [
    { recurso: 'Sonido', inicio: '2026-12-01T08:00:00', fin: '2026-12-01T12:00:00', estado: 'confirmada' }
  ];
  it('detecta un horario solapado del mismo recurso', () => {
    expect(hayConflicto(existentes, { recurso: 'Sonido', inicio: '2026-12-01T11:00:00', fin: '2026-12-01T13:00:00' })).toBe(true);
  });
  it('no choca si empieza justo cuando la otra termina', () => {
    expect(hayConflicto(existentes, { recurso: 'Sonido', inicio: '2026-12-01T12:00:00', fin: '2026-12-01T14:00:00' })).toBe(false);
  });
});

describe('calcularResumen', () => {
  it('devuelve ceros con una lista vacía', () => {
    expect(calcularResumen([])).toEqual({ total: 0, activas: 0, canceladas: 0, horasReservadas: 0 });
  });
});