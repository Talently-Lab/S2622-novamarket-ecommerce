import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import { SharedInput } from '../../components/ui/Input.tsx';
import Icon from '../../components/icons/Icon.tsx';
import { useCategories } from '../../hooks/useCategories.ts';
import { productSchema } from '../../schemas/product.ts';
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../../services/productService.ts';
import {
  ImageUploadError,
  uploadProductImage,
  validateImageFile,
} from '../../services/cloudinaryService.ts';
import {
  adminWriteErrorMessage,
  isMissingProductError,
} from '../../utils/apiErrorMessages.ts';

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
  const { categories, status: categoriesStatus } = useCategories();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(
    isEdit ? 'loading' : 'ready',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  /** Local blob used only while the upload is in flight. */
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEdit || id === undefined) return;

    const controller = new AbortController();
    getProductById(id, controller.signal)
      .then((found) => {
        if (controller.signal.aborted) return;
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
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadStatus(isMissingProductError(error) ? 'missing' : 'error');
      });
    return () => {
      controller.abort();
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

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = '';
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      setImageError(invalid);
      return;
    }

    setImageError(null);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      // The product stores the uploaded URL, never the local blob one: a
      // blob: URL stops resolving as soon as this page reloads.
      const secureUrl = await uploadProductImage(file);
      setField('imageUrl', secureUrl);
      setPreviewUrl(null);
    } catch (error) {
      setField('imageUrl', '');
      setPreviewUrl(null);
      setImageError(
        error instanceof ImageUploadError
          ? error.message
          : 'No pudimos subir la imagen. Intentá de nuevo.',
      );
    } finally {
      setIsUploading(false);
    }
  }

  function clearImage() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setImageError(null);
    setField('imageUrl', '');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Saving mid-upload would persist an empty or blob: image URL.
    if (isUploading) return;
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
      if (isEdit && id !== undefined) {
        await updateProduct(id, parsed.data);
      } else {
        await createProduct(parsed.data);
      }
      navigate('/admin/productos');
    } catch (error) {
      setSaveError(
        adminWriteErrorMessage(error, {
          fallback: 'No pudimos guardar el producto. Intentá de nuevo.',
          notFound: 'El producto ya no existe.',
        }),
      );
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
                  <option value="">
                    {categoriesStatus === 'loading'
                      ? 'Cargando categorías…'
                      : categoriesStatus === 'error'
                        ? 'No pudimos cargar las categorías'
                        : 'Elegí categoría'}
                  </option>
                  {categories.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
              {previewUrl || values.imageUrl ? (
                <img
                  src={previewUrl ?? values.imageUrl}
                  alt="Vista previa del producto"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-2">
                  <Icon name="upload" className="text-2xl text-texto-secundario" />
                  <span className="text-cuerpo text-texto-secundario">
                    Subir imagen (JPG, PNG o WEBP)
                  </span>
                </span>
              )}
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <span role="status" className="text-cuerpo-chico text-texto-secundario">
                Subiendo imagen…
              </span>
            ) : null}
            {values.imageUrl && !isUploading ? (
              <button
                type="button"
                onClick={clearImage}
                className="self-start text-cuerpo-chico text-texto-secundario underline"
              >
                Quitar imagen
              </button>
            ) : null}
            {imageError ?? errors.imageUrl ? (
              <span role="alert" className="text-caption font-semibold text-texto-error">
                {imageError ?? errors.imageUrl}
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
            disabled={isSaving || isUploading}
          >
            {isSaving ? 'Guardando…' : 'Guardar producto'}
          </Button>
        </div>
      </form>
    </>
  );
}
