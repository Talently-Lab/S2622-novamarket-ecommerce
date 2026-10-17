import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import { SharedInput } from '../../components/ui/Input.tsx';
import Icon from '../../components/icons/Icon.tsx';
import { productSchema } from '../../schemas/product.ts';
import {
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from '../../services/adminProductService.ts';
import { getCategoryDisplayName, KNOWN_CATEGORY_ORDER } from '../../utils/categories.ts';

/** Raw text values as the inputs hold them; the schema coerces price/stock. */
interface FormValues {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_VALUES: FormValues = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
};

const FIELD_CLASS =
  'h-12 w-full rounded-md border bg-fondo-superficie px-4 text-cuerpo text-texto-principal placeholder:text-texto-secundario focus:outline-2 focus:outline-borde-foco';

type LoadStatus = 'ready' | 'loading' | 'missing' | 'error';

/**
 * Product create/edit form (SN-251). The design calls it "formulario Modal"
 * but it is a full page: `/admin/productos/nuevo` and
 * `/admin/productos/:id/editar`. Desktop lays the fields out in two columns
 * with the image on the right; mobile stacks them.
 */
export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(
    isEdit ? 'loading' : 'ready',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    listAdminProducts()
      .then((products) => {
        if (cancelled) return;
        const found = products.find(
          (product) => String(product.id) === String(id),
        );
        if (!found) {
          setLoadStatus('missing');
          return;
        }
        setValues({
          name: found.name,
          description: found.description,
          price: String(found.price),
          stock: String(found.stock),
          category: found.category,
          imageUrl: found.imageUrl,
        });
        setLoadStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  // Object URLs created for the local preview would leak otherwise.
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  function setField(key: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) =>
      current[key] ? { ...current, [key]: undefined } : current,
    );
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setField('imageUrl', objectUrl);
  }

  function clearImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setField('imageUrl', '');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && nextErrors[field as keyof FormValues] === undefined) {
          nextErrors[field as keyof FormValues] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);
    setSaveError(null);
    try {
      if (isEdit) {
        await updateAdminProduct(id, parsed.data);
      } else {
        await createAdminProduct(parsed.data);
      }
      navigate('/admin/productos');
    } catch {
      setSaveError('No pudimos guardar el producto. Intentá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  if (loadStatus === 'loading') {
    return <p className="text-cuerpo text-texto-secundario">Cargando…</p>;
  }

  if (loadStatus === 'missing' || loadStatus === 'error') {
    return (
      <div>
        <p className="text-cuerpo text-texto-principal">
          {loadStatus === 'missing'
            ? 'No encontramos ese producto.'
            : 'No pudimos cargar el producto.'}
        </p>
        <Link
          to="/admin/productos"
          className="mt-4 inline-block text-cuerpo-boton font-semibold text-texto-secundario underline"
        >
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/admin/productos"
        className="inline-flex items-center text-cuerpo-chico text-texto-secundario"
      >
        <Icon name="chevron_left" className="text-xl" />
        Productos
      </Link>
      <h1 className="mt-4 text-titulo-2 font-bold text-texto-principal">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6" noValidate>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <SharedInput
              label="Nombre"
              placeholder="Nombre del producto"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              isInvalid={Boolean(errors.name)}
              errorText={errors.name}
            />

            <div className="flex flex-col gap-1">
              <label
                htmlFor="product-category"
                className="text-cuerpo-chico-label text-texto-principal"
              >
                Categoría
              </label>
              <span className="relative">
                <select
                  id="product-category"
                  value={values.category}
                  onChange={(event) => setField('category', event.target.value)}
                  className={`${FIELD_CLASS} appearance-none pr-10 ${
                    errors.category ? 'border-borde-error' : 'border-borde-input'
                  }`}
                >
                  <option value="">Elegí categoría</option>
                  {KNOWN_CATEGORY_ORDER.map((slug) => (
                    <option key={slug} value={slug}>
                      {getCategoryDisplayName(slug)}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xl text-texto-principal"
                />
              </span>
              {errors.category ? (
                <span className="text-caption font-semibold text-texto-error">
                  {errors.category}
                </span>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="product-price"
                  className="text-cuerpo-chico-label text-texto-principal"
                >
                  Precio
                </label>
                <span className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cuerpo text-texto-secundario">
                    $
                  </span>
                  <input
                    id="product-price"
                    inputMode="decimal"
                    placeholder="0"
                    value={values.price}
                    onChange={(event) => setField('price', event.target.value)}
                    className={`${FIELD_CLASS} pl-9 ${
                      errors.price ? 'border-borde-error' : 'border-borde-input'
                    }`}
                  />
                </span>
                {errors.price ? (
                  <span className="text-caption font-semibold text-texto-error">
                    {errors.price}
                  </span>
                ) : null}
              </div>

              <SharedInput
                label="Stock"
                placeholder="0"
                inputMode="numeric"
                value={values.stock}
                onChange={(event) => setField('stock', event.target.value)}
                isInvalid={Boolean(errors.stock)}
                errorText={errors.stock}
              />
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-cuerpo-chico-label text-texto-principal">
                Descripción
              </span>
              <textarea
                rows={5}
                value={values.description}
                onChange={(event) => setField('description', event.target.value)}
                className={`${FIELD_CLASS} h-auto py-3 ${
                  errors.description ? 'border-borde-error' : 'border-borde-input'
                }`}
              />
              {errors.description ? (
                <span className="text-caption font-semibold text-texto-error">
                  {errors.description}
                </span>
              ) : null}
            </label>

            {/* Deliberately inert. The design shows "Specs clave", but the
                backend product DTO has no such field and the detail page
                (SN-250) that would consume it does not exist yet. The control
                is rendered to match the design; its value is never read,
                validated or saved. Note: it is editable but discarded —
                switch it to readOnly/disabled if that stops being wanted. */}
            <label className="flex flex-col gap-1">
              <span className="text-cuerpo-chico-label text-texto-principal">
                Specs clave (se muestran arriba en el detalle, máximo 3)
              </span>
              <input type="text" defaultValue="" className={FIELD_CLASS} />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-cuerpo-chico-label text-texto-principal">
              Imagen
            </span>
            <label
              htmlFor="product-image"
              className="flex h-56 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-borde-input bg-fondo-deshabilitado/40 text-center"
            >
              {values.imageUrl ? (
                <img
                  src={values.imageUrl}
                  alt="Vista previa del producto"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-2">
                  <Icon name="upload" className="text-2xl text-texto-secundario" />
                  <span className="text-cuerpo text-texto-secundario">
                    Subir imagen (JPG o PNG)
                  </span>
                </span>
              )}
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="sr-only"
            />
            {values.imageUrl ? (
              <button
                type="button"
                onClick={clearImage}
                className="self-start text-cuerpo-chico text-texto-secundario underline"
              >
                Quitar imagen
              </button>
            ) : null}
            {errors.imageUrl ? (
              <span className="text-caption font-semibold text-texto-error">
                {errors.imageUrl}
              </span>
            ) : null}
          </div>
        </div>

        {saveError ? (
          <p
            role="alert"
            className="mt-6 rounded-md border border-borde-error px-4 py-3 text-cuerpo-chico text-texto-error"
          >
            {saveError}
          </p>
        ) : null}

        <div className="mt-8 flex justify-end gap-3 border-t border-borde-divisor pt-6">
          <Button
            type="button"
            variant="secondary"
            style={{ width: 'auto' }}
            onClick={() => navigate('/admin/productos')}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            style={{ width: 'auto' }}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando…' : 'Guardar producto'}
          </Button>
        </div>
      </form>
    </>
  );
}
