import React, { useState } from 'react';
import { db, saveService, removeService, newService, type Service, type Unit } from '../db';
import { useServices } from '../data/queries';
import { formatBRL, parseBRLToCents } from '../lib/money';

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'un', label: 'un (unidade)' },
  { value: 'h', label: 'h (hora)' },
  { value: 'm²', label: 'm² (metro quadrado)' },
  { value: 'dia', label: 'dia (diária)' },
];

export const ServicesScreen: React.FC = () => {
  const services = useServices();

  // Estado do formulário — guardamos APENAS o id do serviço sendo editado
  const [name, setName] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [unit, setUnit] = useState<Unit>('un');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mensagens de validação
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setPriceInput('');
    setUnit('un');
    setEditingId(null);
    setNameError(null);
    setPriceError(null);
    setFormMessage(null);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setName(service.name);
    setPriceInput(formatBRL(service.unitPriceCents).replace(/^R\$\s*/, ''));
    setUnit(service.unit);
    setNameError(null);
    setPriceError(null);
    setFormMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o serviço "${service.name}"?`,
    );
    if (!confirmed) return;

    await removeService(service.id);
    if (editingId === service.id) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('O nome do serviço é obrigatório.');
      hasError = true;
    } else {
      setNameError(null);
    }

    const priceCents = parseBRLToCents(priceInput);
    if (priceCents <= 0) {
      setPriceError('O preço deve ser maior que zero.');
      hasError = true;
    } else {
      setPriceError(null);
    }

    if (hasError) return;

    if (editingId) {
      // Relê o registro atual do banco para não regravar uma cópia velha
      const current = await db.services.get(editingId);
      if (!current || current.deleted === 1) {
        setFormMessage('Este serviço foi removido.');
        setEditingId(null);
        return;
      }
      await saveService({
        ...current,
        name: trimmedName,
        unitPriceCents: priceCents,
        unit,
      });
    } else {
      const created = newService({
        name: trimmedName,
        unitPriceCents: priceCents,
        unit,
      });
      await saveService(created);
    }

    resetForm();
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4 pb-28">
      {/* Cabeçalho da tela */}
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Catálogo de Serviços
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cadastre e gerencie os serviços que você oferece aos seus clientes.
        </p>
      </header>

      {/* Formulário de Adicionar / Editar */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            {editingId ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          {editingId && (
            <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
              Modo Edição
            </span>
          )}
        </div>

        {formMessage && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {formMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label
              htmlFor="service-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Nome do Serviço <span className="text-red-500">*</span>
            </label>
            <input
              id="service-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Ex.: Instalação de chuveiro"
              className={`w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                nameError
                  ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
            />
            {nameError && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {nameError}
              </p>
            )}
          </div>

          {/* Linha com Preço e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            {/* Campo Preço */}
            <div>
              <label
                htmlFor="service-price"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none">
                  R$
                </span>
                <input
                  id="service-price"
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => {
                    setPriceInput(e.target.value);
                    if (priceError) setPriceError(null);
                  }}
                  placeholder="0,00"
                  className={`w-full min-h-[44px] pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
                    priceError
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                  }`}
                />
              </div>
              {priceError && (
                <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {priceError}
                </p>
              )}
            </div>

            {/* Campo Unidade */}
            <div>
              <label
                htmlFor="service-unit"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Unidade
              </label>
              <select
                id="service-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="w-full min-h-[44px] px-3 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600 text-slate-700"
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões do Formulário */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl px-4 py-2.5 transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {editingId ? 'Salvar Alterações' : 'Adicionar Serviço'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-medium text-sm rounded-xl transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Lista de Serviços Cadastrados */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Serviços Cadastrados
          </h2>
          {services && services.length > 0 && (
            <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {services.length}
            </span>
          )}
        </div>

        {/* Estado Carregando */}
        {services === undefined && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            Carregando serviços...
          </div>
        )}

        {/* Estado Vazio Amigável */}
        {services !== undefined && services.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Cadastre seu primeiro serviço
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Preencha o formulário acima com o nome, preço e unidade para poder
              montar seus orçamentos de forma rápida.
            </p>
          </div>
        )}

        {/* Lista de Itens */}
        {services && services.length > 0 && (
          <ul className="space-y-2.5">
            {services.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-blue-600">
                      {formatBRL(item.unitPriceCents)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {item.unit}
                    </span>
                  </div>
                </div>

                {/* Ações (mínimo 44px de altura) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    title={`Editar ${item.name}`}
                    aria-label={`Editar ${item.name}`}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    title={`Excluir ${item.name}`}
                    aria-label={`Excluir ${item.name}`}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Excluir</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
