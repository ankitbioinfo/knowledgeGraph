from gensim.models import Word2Vec
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE


'''
node2vec = Node2Vec(G, dimensions=64, walk_length=30, num_walks=200, workers=2)
model = node2vec.fit(window=10, min_count=1)

model.wv.save("node2vec_embeddings.kv")
model.save("node2vec_full.model")
'''

embeddings = Word2Vec.load("node2vec_full.model").wv
print(embeddings.index_to_key[:10])
loaded_model = Word2Vec.load("node2vec_full.model")

nodes = list(embeddings.index_to_key)
X = np.array([embeddings[node] for node in nodes])
labels = ['Chemical' if node.startswith('CID') else 'Protein' for node in nodes]

# Reduce to 2D
tsne = TSNE(n_components=2, random_state=42, perplexity=30)
X_2d = tsne.fit_transform(X)
# Plot
plt.figure(figsize=(10, 8))
for label in set(labels):
    idx = [i for i, l in enumerate(labels) if l == label]
    plt.scatter(X_2d[idx, 0], X_2d[idx, 1], label=label, alpha=0.6)
plt.legend()
plt.title("t-SNE of Node2Vec Embeddings")
plt.xlabel("t-SNE 1")
plt.ylabel("t-SNE 2")
plt.show()
