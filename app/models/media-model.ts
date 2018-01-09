import {Entity, Column, PrimaryColumn, Repository, EntityRepository, ManyToMany, ManyToOne, JoinTable, JoinColumn, Index} from 'typeorm'
import {Label} from './label-model'
import {Library} from './library-model'

@Entity({name: 'media'})
@Index(['libraryId', 'path'])
export class MediaFile
{
    @PrimaryColumn()
    public path: string

    @Column()
    public s3key: string

    @PrimaryColumn({name: 'library_id'})
    public libraryId: number

    @ManyToOne(t => Library)
    @JoinColumn({name: 'library_id'})
    public library: Library

    @Column()
    public caption: string

    @Column()
    public attribution: string

    @ManyToMany(t => Label)
    @JoinTable({name: 'media_labels', joinColumn: {name: 'media_id'}, inverseJoinColumn: {name: 'label_id'}})
    public labels: Label[]
}

@EntityRepository(MediaFile)
export class MediaFileRepository extends Repository<MediaFile>
{
    public async findAllByLibrary({libraryID}: {libraryID: number})
    {
        return this.find({
            select: [
                's3key',
                'path',
                'caption',
                'attribution'
            ],
            where: {
                libraryId: libraryID
            }
        })
    }
}