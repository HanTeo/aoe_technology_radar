import fs, { readFile, outputFile } from 'fs-extra';
import path from 'path';
import frontmatter from 'front-matter';
import marked from 'marked';
import {
  radarPath,
  distPath,
  getAllMarkdownFiles,
} from './file';
import {
  item as itemTemplate,
  quadrant as quadrantTemplate,
  vars,
} from './template';

export const createRadar = async (tree) => {
  const fileNames = (await getAllMarkdownFiles(radarPath()));
  const revisions = await createRevisionsFromFiles(fileNames);
  const allReleases = getAllReleases(revisions);
  const items = createItems(revisions);
  const itemsWithIsNewFlag = flagWithIsNew(items, allReleases);
  const quadrants = groupByQuadrants(itemsWithIsNewFlag);

  return quadrants;
};

const createRevisionsFromFiles = (fileNames) => (
  Promise.all(fileNames.map((fileName) => {
    return new Promise((resolve, reject) => {
      readFile(fileName, 'utf8', (err, data) => {
        if(err) {
          reject(err);
        } else {
          const fm = frontmatter(data);
          resolve({
            ...itemInfoFromFilename(fileName),
            fileName,
            attributes: fm.attributes,
            body: marked(fm.body),
          });
        }
      });
    })
  }))
)

const itemInfoFromFilename = (fileName) => {
  const [
    release,
    quadrant,
    nameWithSuffix,
  ] = fileName.split('/').slice(-3);
  return {
    name: nameWithSuffix.substr(0, nameWithSuffix.length - 3),
    release,
    quadrant,
  }
};

const getAllReleases = (revisions) => (
  revisions.reduce((allReleases, { release }) => {
    if(!allReleases.includes(release)) {
      return [...allReleases, release];
    }
    return allReleases;
  }, []).sort()
)

// const createQuadrants = (revisions) => (
//   revisions.reduce((quadrants, revision) => {
//     return {
//       ...quadrants,
//       [revision.quadrant]: addRevisionToQuadrant(quadrants[revision.quadrant], revision),
//     };
//   }, {})
// );

// const addRevisionToQuadrant = (quadrant = {}, revision) => ({
//   ...quadrant,
//   [revision.name]: addRevisionToItem(quadrant[revision.name], revision),
// });

const addRevisionToQuadrant = (quadrant = {}, revision) => ({
  ...quadrant,
  [revision.attributes.ring]: addRevisionToRing(quadrant[revision.attributes.ring], revision),
});

const createItems = (revisions) => {
  const itemMap = revisions.reduce((items, revision) => {
    return {
      ...items,
      [revision.name]: addRevisionToItem(items[revision.name], revision),
    };
  }, {});

  return Object
    .values(itemMap)
    .sort((x, y) => (x.name > y.name ? 1 : -1));
}

const addRevisionToItem = (item = {
  attributes: {
    isFeatured: true,
  },
  revisions: [],
}, revision) => {
  const {
    fileName,
    ...rest,
  } = revision;
  let newItem = {
    ...item,
    ...rest,
    attributes: {
      ...item.attributes,
      ...revision.attributes,
    },
  };

  if (revisionCreatesNewHistoryEntry(revision)) {
    newItem = {
      ...newItem,
      revisions: [
        rest,
        ...newItem.revisions,
      ],
    }
  }

  return newItem;
};

const revisionCreatesNewHistoryEntry = (revision) => {
  return revision.body.trim() !== '' ||
         typeof revision.attributes.ring !== 'undefined';
};

export const outputRadar = (radar) => {
  return Promise.all(
    Object.entries(radar).map(async ([quadrantName, quadrant]) => {
      await outputQuadrantPage(quadrantName, quadrant);
      Object.entries(quadrant).map(([itemName, item]) => (
        new Promise((resolve, reject) => {
          outputFile(distPath(quadrantName, `${itemName}.html`), itemTemplate(vars({
            quadrantName,
            item,
          })), (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          })
        })
      ))
    })
  );
};

const outputQuadrantPage = (quadrantName, quadrant) => (
  new Promise((resolve, reject) => {
    outputFile(distPath(`${quadrantName}.html`), quadrantTemplate(vars({
      quadrantName,
      quadrant,
    })), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
)

const flagWithIsNew = (items, allReleases) => (
  items.map((item) => ({
    ...item,
    isNew: isNewItem(item, allReleases),
  }), [])
);

const isNewItem = (item, allReleases) => {
  return item.revisions[0].release === allReleases[allReleases.length-1]
}

const groupByQuadrants = (items) => (
  items.reduce((quadrants, item) => ({
    ...quadrants,
    [item.quadrant]: addItemToQuadrant(quadrants[item.quadrant], item),
  }), {})
);

const addItemToQuadrant = (quadrant = {}, item) => ({
  ...quadrant,
  [item.attributes.ring]: addItemToRing(quadrant[item.attributes.ring], item),
});

const addItemToRing = (ring = [], item) => ([
  ...ring,
  item,
]);