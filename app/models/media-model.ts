import {Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Repository, EntityRepository, ManyToMany, OneToMany, ManyToOne, JoinTable, JoinColumn, Index} from 'typeorm'
import {LabelModel} from './label-model'
import {LibraryModel} from './library-model'

type MediaState = 'Ready' | 'Pending' | 'Deleted'

@Entity({name: 'media_storage'})
@Index(['contentMD5'])
export class MediaStorageModel
{
    @PrimaryGeneratedColumn()
    public id: number
    
    @Column()
    public s3key: string

    @Column({name: 'thumb_s3key'})
    public thumbS3key: string

    @Column({name: 'content_md5'})
    public contentMD5: string
   
    @Column({type: 'enum', enum: ['Ready', 'Pending', 'Deleted']})
    public state: MediaState

    @OneToMany(t => MediaModel, m => m.library)
    public media: MediaModel[]
}

@Entity({name: 'media'})
@Index(['libraryId', 'path'])
export class MediaModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @PrimaryColumn()
    public path: string

    @Column({name: 'storage_id'})
    public storageId: number

    @ManyToOne(t => MediaStorageModel)
    @JoinColumn({name: 'storage_id'})
    public storage: MediaStorageModel

    @PrimaryColumn({name: 'library_id'})
    public libraryId: number

    @ManyToOne(t => LibraryModel)
    @JoinColumn({name: 'library_id'})
    public library: LibraryModel

    @Column()
    public caption: string

    @Column()
    public attribution: string

    // @ManyToMany(t => LabelModel)
    // @JoinTable({name: 'media_labels', joinColumn: {name: 'media_id'}, inverseJoinColumn: {name: 'label_id'}})
    // public labels: LabelModel[]
}

@EntityRepository(MediaModel)
export class MediaFileRepository extends Repository<MediaModel>
{
    public async findAllByLibrary({libraryID}: {libraryID: number}) : Promise<{id: number, s3key: string, thumb_s3key: string, path: string, caption?: string, attribution?: string}[]>
    {
        return this.createQueryBuilder('media')
            .innerJoinAndSelect('media_storage', 'storage', 'storage.id=media.storage_id')
            .where('media.library_id=:library_id', {library_id: libraryID})
            .select([
                'path',
                'caption',
                'attribution'
            ])
            .addSelect('media.id', 'id')
            .addSelect('storage.s3key', 's3key')
            .addSelect('storage.thumb_s3key', 'thumb_s3key')
            .getRawMany()
    }

    public async findByPath({libraryID, path}: {libraryID: number, path: string}) : Promise<{id: number, s3key: string, thumb_s3key: string, path: string, caption?: string, attribution?: string, state: MediaState}|undefined>
    {
        return this.createQueryBuilder('media')
            .innerJoinAndSelect('media_storage', 'storage', 'storage.id=media.storage_id')
            .where('media.library_id=:library_id AND media.path=:path', {library_id: libraryID, path})
            .select([
                'path',
                'caption',
                'attribution'
            ])
            .addSelect('media.id', 'id')
            .addSelect('storage.s3key', 's3key')
            .addSelect('storage.thumb_s3key', 'thumb_s3key')
            .getRawOne()
    }
}