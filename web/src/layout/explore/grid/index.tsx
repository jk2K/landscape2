import isUndefined from 'lodash/isUndefined';
import { createEffect, createSignal, For, onMount, Show } from 'solid-js';

import cutString from '../../../utils/cutString';
import isAllChinese from '../../../utils/isAllChinese';
import generateColorsArray from '../../../utils/generateColorsArray';
import { SubcategoryDetails } from '../../../utils/gridCategoryLayout';
import { CategoriesData, CategoryData } from '../../../utils/prepareData';
import Grid from './Grid';
import styles from './GridCategory.module.css';

interface Props {
  data: CategoriesData;
  categories_overridden?: string[];
  initialIsVisible: boolean;
  finishLoading: () => void;
}

interface CatProps {
  index: number;
  catSectionNumber: number;
  bgColor: string;
  categoryName: string;
  isOverriden: boolean;
  content: CategoryData;
}

const Category = (props: CatProps) => {
  const [subcategories, setSubcategories] = createSignal<SubcategoryDetails[]>();

  createEffect(
    () => {
      if (!isUndefined(props.content)) {
        const subcategoriesTmp: SubcategoryDetails[] = [];
        Object.keys(props.content).forEach((subcat: string) => {
          if (props.content[subcat].items.length !== 0) {
            subcategoriesTmp.push({
              name: subcat,
              itemsCount: props.content[subcat].itemsCount,
              itemsFeaturedCount: props.content[subcat].itemsFeaturedCount,
            });
          }
        });

        setSubcategories(subcategoriesTmp);
      }
    },
    { refer: true }
  );

  return (
    <Show when={!isUndefined(subcategories()) && subcategories()!.length > 0}>
      <div class="d-flex flex-row">
        <div
          class={`text-white border border-3 border-white fw-medium border-end-0 d-flex flex-row align-items-center justify-content-end ${styles.catTitle}`}
          classList={{
            'border-bottom-0': props.index !== 0,
            'border-top-0': props.index === props.catSectionNumber,
          }}
          style={{ 'background-color': props.bgColor }}
        >
          <div class={`text-center ${isAllChinese(props.categoryName) ? styles.catTitleTextCn : styles.catTitleText}`}>{cutString(props.categoryName, 30)}</div>
        </div>

        <div class="d-flex flex-column w-100 align-items-stretch">
          <Grid
            categoryName={props.categoryName}
            isOverriden={props.isOverriden}
            subcategories={subcategories()!}
            initialCategoryData={props.content}
            backgroundColor={props.bgColor}
            categoryIndex={props.index}
          />
        </div>
      </div>
    </Show>
  );
};

const GridCategory = (props: Props) => {
  const [colorsList, setColorsList] = createSignal<string[]>([]);
  const [firstLoad, setFirstLoad] = createSignal<boolean>(false);
  const [isVisible, setIsVisible] = createSignal<boolean>(false);

  createEffect(() => {
    if (props.initialIsVisible !== isVisible()) {
      setIsVisible(props.initialIsVisible);
      if (props.initialIsVisible && !firstLoad()) {
        setFirstLoad(true);
        props.finishLoading();
      }
    }
  });

  onMount(() => {
    setColorsList(generateColorsArray(Object.keys(props.data).length));
  });

  return (
    <Show when={firstLoad()}>
      <For each={Object.keys(props.data)}>
        {(cat, index) => {
          const isOverriden = !isUndefined(props.categories_overridden) && props.categories_overridden.includes(cat);

          return (
            <Category
              index={index()}
              isOverriden={isOverriden}
              categoryName={cat}
              bgColor={[...colorsList()][index()]}
              catSectionNumber={Object.keys(props.data).length - 1}
              content={props.data[cat]}
            />
          );
        }}
      </For>
    </Show>
  );
};

export default GridCategory;
