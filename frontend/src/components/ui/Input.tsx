import { Field, Input as ChakraInput, InputGroup } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useId } from 'react';

// Shared NovaMarket input (Figma "Inputs" set).
// Wraps Chakra Field + Input so the team imports a single component
// with label, helper/error text, an optional right icon and the five
// Figma states (Default / Focus / Error / Completed / Disabled).
// Styling comes from the `input` recipe in src/theme/input.recipe.ts;
// this wrapper only wires state, text slots and accessibility.
// UI copy stays in Spanish; identifiers and comments stay in English.
// NOTE: Figma labels the text #0E2926, which has no theme token yet,
// so the label uses texto.principal until design confirms the token.
export type SharedInputVisualState =
  | 'default'
  | 'focus'
  | 'error'
  | 'completed'
  | 'disabled';

export interface SharedInputProps
  extends Omit<
    React.ComponentProps<typeof ChakraInput>,
    'invalid' | 'disabled' | 'id'
  > {
  label: string;
  helperText?: string;
  errorText?: string;
  icon?: ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isCompleted?: boolean;
  visualState?: SharedInputVisualState;
  id?: string;
}

function resolveVisualState(props: {
  visualState?: SharedInputVisualState;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isCompleted?: boolean;
}): SharedInputVisualState {
  if (props.visualState) return props.visualState;
  if (props.isDisabled) return 'disabled';
  if (props.isInvalid) return 'error';
  if (props.isCompleted) return 'completed';
  return 'default';
}

export function SharedInput({
  label,
  helperText,
  errorText,
  icon,
  isDisabled = false,
  isInvalid = false,
  isCompleted = false,
  visualState,
  id: idProp,
  ...inputProps
}: SharedInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const resolved = resolveVisualState({
    visualState,
    isDisabled,
    isInvalid,
    isCompleted,
  });
  const invalid = isInvalid || resolved === 'error';
  const disabled = isDisabled || resolved === 'disabled';
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = invalid && errorText ? errorId : helperText ? helperId : undefined;

  return (
    <Field.Root invalid={invalid} disabled={disabled} id={id}>
      <Field.Label fontSize="14px" fontWeight="500" color="texto.principal">
        {label}
      </Field.Label>
      <InputGroup endElement={icon} width="100%">
        <ChakraInput
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          data-visual-state={resolved}
          data-completed={isCompleted || resolved === 'completed' || undefined}
          {...inputProps}
        />
      </InputGroup>
      {helperText && !invalid ? (
        <Field.HelperText id={helperId} fontSize="12px" color="texto.principal">
          {helperText}
        </Field.HelperText>
      ) : null}
      {invalid && errorText ? (
        <Field.ErrorText id={errorId} fontSize="12px" fontWeight="600" color="texto.error">
          {errorText}
        </Field.ErrorText>
      ) : null}
    </Field.Root>
  );
}
